// Everything a form submission goes through on the server, in order:
// honeypot -> Turnstile -> rate limit -> save -> email alert.
import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { KINDS, alertEmail, alertText, type Kind, type ManufacturerRow, type RfqRow } from "@/lib/records";
import type { SubmitResult } from "@/lib/schemas";

const MAX_PER_HOUR = 5;
const isProduction = process.env.NODE_ENV === "production";

export type SubmitMeta = {
  submissionId: string;
  turnstileToken: string;
  /** Hidden field real people never fill in. */
  website: string;
};

const fail = (message: string): SubmitResult => ({ ok: false, message });

/** The server's own connection to the database. Returns null if it isn't configured. */
export function database(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function passesTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Without a secret we can't check. That is allowed on a developer's machine
  // only; the live site refuses rather than letting unchecked traffic in.
  if (!secret) return !isProduction;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function sendAlert(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!key || !to || !from) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  return res.ok;
}

/**
 * Emails the owner about one saved record and, if the email went out, stamps
 * `notified_at` on the row. Returns whether it was sent. Never throws: a failed
 * email leaves `notified_at` empty so it can be resent from the console.
 */
export async function notifyOwner(
  db: SupabaseClient,
  kind: Kind,
  row: RfqRow | ManufacturerRow,
): Promise<boolean> {
  try {
    const { subject, lines } = alertEmail(kind, row);
    if (!(await sendAlert(subject, alertText(lines)))) {
      console.error(`Alert email not sent for ${row.reference}`);
      return false;
    }
    const stamped = await db
      .from(KINDS[kind].table)
      .update({ notified_at: new Date().toISOString() })
      .eq("id", row.id);
    if (stamped.error) console.error(`Alert sent for ${row.reference} but notified_at not saved`);
    return true;
  } catch (error) {
    console.error(`Alert email failed for ${row.reference}`, error);
    return false;
  }
}

/**
 * Saves one submission and returns its reference number.
 * `row` must already be validated; this function handles everything else.
 */
export async function saveSubmission(
  kind: Kind,
  meta: SubmitMeta,
  row: Record<string, unknown>,
): Promise<SubmitResult> {
  const table = KINDS[kind].table;
  // A filled honeypot means a bot. Say nothing useful and save nothing.
  if (meta.website) return fail("We couldn't send your request. Please try again.");

  if (!/^[0-9a-f-]{36}$/i.test(meta.submissionId)) {
    return fail("Something went wrong with this form. Reload the page and try again.");
  }

  const db = database();
  if (!db) {
    console.error("Supabase is not configured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
    return fail("We can't accept requests right now. Please try again later.");
  }

  const ip = await clientIp();
  if (!(await passesTurnstile(meta.turnstileToken, ip))) {
    return fail("We couldn't confirm you're a person. Complete the check and try again.");
  }

  // A retry of a request we already saved gets its reference back straight
  // away, before the rate limit, so it is never mistaken for a new request.
  const saved = await db
    .from(table)
    .select("reference")
    .eq("submission_id", meta.submissionId)
    .maybeSingle();
  if (saved.data) return { ok: true, reference: saved.data.reference };

  const ipHash = hashIp(ip);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", hourAgo);
  if (recent.error) {
    console.error(`Rate-limit check failed on ${table}`, recent.error.message);
    return fail("We couldn't save your request. Please try again in a minute.");
  }
  if ((recent.count ?? 0) >= MAX_PER_HOUR) {
    return fail("You've sent several requests in the last hour. Please try again later.");
  }

  const insert = await db
    .from(table)
    .insert({ ...row, submission_id: meta.submissionId, ip_hash: ipHash })
    .select("*")
    .single();

  if (insert.error) {
    // 23505 = this submission_id is already saved (double click or retry).
    // Hand back the existing reference instead of creating a second row.
    if (insert.error.code === "23505") {
      const existing = await db
        .from(table)
        .select("reference")
        .eq("submission_id", meta.submissionId)
        .single();
      if (existing.data) return { ok: true, reference: existing.data.reference };
    }
    console.error(`Insert into ${table} failed`, insert.error.message);
    return fail("We couldn't save your request. Please try again in a minute.");
  }

  // The request is saved. Email is a courtesy on top: if it fails, the
  // customer still sees success and `notified_at` stays empty for a resend.
  await notifyOwner(db, kind, insert.data);

  return { ok: true, reference: insert.data.reference };
}
