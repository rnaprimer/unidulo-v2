// Everything a form submission goes through on the server, in order:
// honeypot -> Turnstile -> rate limit -> save -> email alert.
import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SubmitResult } from "@/lib/schemas";

const MAX_PER_HOUR = 5;
const isProduction = process.env.NODE_ENV === "production";

export type SubmitMeta = {
  submissionId: string;
  turnstileToken: string;
  /** Hidden field real people never fill in. */
  website: string;
};

type Table = "rfqs" | "manufacturer_applications";

const fail = (message: string): SubmitResult => ({ ok: false, message });

function database(): SupabaseClient | null {
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

async function sendAlert(subject: string, lines: [string, unknown][]): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!key || !to || !from) return false;
  const text = lines
    .filter(([, value]) => value !== "" && value != null)
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  return res.ok;
}

/**
 * Saves one submission and returns its reference number.
 * `row` must already be validated; this function handles everything else.
 */
export async function saveSubmission(
  table: Table,
  meta: SubmitMeta,
  row: Record<string, unknown>,
  email: { subject: (reference: string) => string; lines: [string, unknown][] },
): Promise<SubmitResult> {
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
    .select("id, reference")
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

  const { id, reference } = insert.data;

  // The request is saved. Email is a courtesy on top: if it fails, the
  // customer still sees success and `notified_at` stays empty for a resend.
  try {
    const sent = await sendAlert(email.subject(reference), [["Reference", reference], ...email.lines]);
    if (sent) {
      await db.from(table).update({ notified_at: new Date().toISOString() }).eq("id", id);
    } else {
      console.error(`Alert email not sent for ${reference}`);
    }
  } catch (error) {
    console.error(`Alert email failed for ${reference}`, error);
  }

  return { ok: true, reference };
}
