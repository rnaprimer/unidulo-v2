// Server-only code for the owner's console at /ops: who is allowed in, and the
// database reads the console pages need. Nothing here ever runs in the browser.
import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  KINDS,
  isOwner,
  isUuid,
  pageRange,
  type Kind,
  type ManufacturerRow,
  type RecordRow,
  type RfqRow,
} from "@/lib/records";
import { database } from "@/lib/server/submit";

// The sign-in cookie. It is only ever sent to /ops, and scripts in the browser
// can't read it. It holds the session token Supabase issued at sign-in.
const SESSION_COOKIE = "ops_session";
// The cookie outlives the session on purpose: an old cookie is how we can tell
// "your session ended" apart from "you never signed in".
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const LOGIN_PATH = "/ops/login";

/** A separate Supabase connection used only to check sign-ins, never to read data. */
function authClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).auth;
}

/**
 * The gate. Every /ops page and every /ops server action calls this first.
 * It returns only if the request carries a live session that belongs to the
 * owner. Anyone else is sent to the login page and nothing after it runs.
 */
export async function requireOwner(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect(LOGIN_PATH);

  const auth = authClient();
  const ownerId = process.env.OWNER_USER_ID;
  if (!auth || !ownerId) {
    console.error("Console is not configured: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OWNER_USER_ID missing");
    redirect(LOGIN_PATH);
  }

  // Ask Supabase whether this session is still good. This is a network call on
  // purpose: a token that merely looks valid is not trusted.
  const { data, error } = await auth.getUser(token);
  if (error) {
    // 4xx means Supabase rejected the session (expired or signed out).
    if (error.status && error.status >= 400 && error.status < 500) redirect(`${LOGIN_PATH}?expired=1`);
    throw new Error("Could not check your sign-in with Supabase. Try again in a minute.");
  }
  // A real Supabase user who isn't the owner gets exactly what a stranger gets.
  if (!isOwner(data.user?.id, ownerId)) redirect(LOGIN_PATH);
}

/** Checks an email and password. Starts a session only if they belong to the owner. */
export async function signInOwner(email: string, password: string): Promise<boolean> {
  const auth = authClient();
  const ownerId = process.env.OWNER_USER_ID;
  if (!auth || !ownerId) {
    console.error("Console is not configured: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OWNER_USER_ID missing");
    return false;
  }
  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data.session) return false;
  if (!isOwner(data.user?.id, ownerId)) {
    // Right password, wrong person: end the session we just created and say no.
    await auth.admin.signOut(data.session.access_token, "local").catch(() => {});
    return false;
  }
  (await cookies()).set(SESSION_COOKIE, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/ops",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return true;
}

/** Ends the session at Supabase and removes the cookie. */
export async function signOutOwner(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  // "local" ends this one session only, so signing out on a phone leaves a laptop signed in.
  if (token) await authClient()?.admin.signOut(token, "local").catch(() => {});
  // Deleting needs the same path the cookie was set with.
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/ops", maxAge: 0 });
}

/** The database connection for console code. Callers must have passed requireOwner() first. */
export function opsDb() {
  const db = database();
  if (!db) throw new Error("The database is not configured on the server.");
  return db;
}

// --- Reads ----------------------------------------------------------------------

const LIST_COLUMNS = {
  rfq: "id, reference, created_at, status, contact_name, company, packaging_type, quantity, next_action, next_action_due, notified_at",
  manufacturer:
    "id, reference, created_at, status, contact_name, company_name, products, next_action, next_action_due, notified_at",
} as const;

export type ListRow = {
  id: string;
  reference: string;
  created_at: string;
  status: string;
  contact_name: string;
  company?: string;
  company_name?: string;
  packaging_type?: string;
  quantity?: number;
  products?: string[];
  next_action: string;
  next_action_due: string | null;
  notified_at: string | null;
};

/** One page of records, newest first, optionally only those in one status. */
export async function listRecords(
  kind: Kind,
  status: string | null,
  page: number,
): Promise<{ rows: ListRow[]; total: number }> {
  await requireOwner();
  const { from, to } = pageRange(page);
  let query = opsDb()
    .from(KINDS[kind].table)
    .select(LIST_COLUMNS[kind], { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query;
  // PGRST103: the page asked for is past the last row. Treat it as an empty page.
  if (error && error.code !== "PGRST103") throw new Error(`Could not load the list: ${error.message}`);
  return { rows: (data ?? []) as unknown as ListRow[], total: count ?? 0 };
}

export type Note = { id: string; body: string; created_at: string };

/** One record with its notes, newest note first. Shows "not found" for an unknown id. */
export async function getRecord<K extends Kind>(
  kind: K,
  id: string,
): Promise<{ row: RecordRow<K>; notes: Note[] }> {
  await requireOwner();
  if (!isUuid(id)) notFound();
  const db = opsDb();
  const [record, notes] = await Promise.all([
    db.from(KINDS[kind].table).select("*").eq("id", id).maybeSingle(),
    db
      .from("notes")
      .select("id, body, created_at")
      .eq(KINDS[kind].noteColumn, id)
      .order("created_at", { ascending: false }),
  ]);
  if (record.error) throw new Error(`Could not load the record: ${record.error.message}`);
  if (notes.error) throw new Error(`Could not load the notes: ${notes.error.message}`);
  if (!record.data) notFound();
  return { row: record.data as RfqRow | ManufacturerRow as RecordRow<K>, notes: notes.data as Note[] };
}
