"use server";

// Server Actions for the owner's console. The browser can call any of these
// directly, so each one checks the owner first and trusts nothing it is sent.
import { redirect } from "next/navigation";
import {
  KINDS,
  isKind,
  isStatus,
  isUuid,
  nextActionSchema,
  noteSchema,
  type Kind,
  type ManufacturerRow,
  type RfqRow,
} from "@/lib/records";
import { LOGIN_PATH, opsDb, requireOwner, signInOwner, signOutOwner } from "@/lib/server/ops";
import { notifyOwner } from "@/lib/server/submit";

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

export async function signIn(form: FormData): Promise<void> {
  const ok = await signInOwner(field(form, "email").trim(), field(form, "password"));
  redirect(ok ? "/ops" : `${LOGIN_PATH}?error=1`);
}

export async function signOut(): Promise<void> {
  await signOutOwner();
  redirect(`${LOGIN_PATH}?signedout=1`);
}

/** Which record a form is about. Sends a tampered form back to the list. */
function target(form: FormData): { kind: Kind; id: string; back: (note: string) => never } {
  const kind = field(form, "kind");
  const id = field(form, "id");
  if (!isKind(kind) || !isUuid(id)) redirect("/ops");
  return { kind, id, back: (note) => redirect(`/ops/${kind}/${id}?${note}`) };
}

export async function updateStatus(form: FormData): Promise<void> {
  await requireOwner();
  const { kind, id, back } = target(form);
  const status = field(form, "status");
  if (!isStatus(kind, status)) return back("error=status");

  // Asking for the row back tells us whether a record with this id really existed.
  const { data, error } = await opsDb().from(KINDS[kind].table).update({ status }).eq("id", id).select("id");
  if (error || data.length === 0) {
    console.error(`Status change failed on ${kind} ${id}`, error?.message ?? "no such record");
    return back("error=save");
  }
  return back("saved=status");
}

export async function updateNextAction(form: FormData): Promise<void> {
  await requireOwner();
  const { kind, id, back } = target(form);
  const parsed = nextActionSchema.safeParse({
    nextAction: field(form, "next_action"),
    due: field(form, "next_action_due"),
  });
  if (!parsed.success) return back("error=next");

  const { data, error } = await opsDb()
    .from(KINDS[kind].table)
    .update({ next_action: parsed.data.nextAction, next_action_due: parsed.data.due || null })
    .eq("id", id)
    .select("id");
  if (error || data.length === 0) {
    console.error(`Next action change failed on ${kind} ${id}`, error?.message ?? "no such record");
    return back("error=save");
  }
  return back("saved=next");
}

export async function addNote(form: FormData): Promise<void> {
  await requireOwner();
  const { kind, id, back } = target(form);
  const parsed = noteSchema.safeParse(field(form, "body"));
  if (!parsed.success) return back("error=note");

  const { error } = await opsDb()
    .from("notes")
    .insert({ [KINDS[kind].noteColumn]: id, body: parsed.data });
  if (error) {
    console.error(`Note not saved on ${kind} ${id}`, error.message);
    return back("error=save");
  }
  return back("saved=note");
}

/** Sends the owner alert again for a record whose first alert never went out. */
export async function resendAlert(form: FormData): Promise<void> {
  await requireOwner();
  const { kind, id, back } = target(form);
  const db = opsDb();
  const { data, error } = await db.from(KINDS[kind].table).select("*").eq("id", id).maybeSingle();
  if (error || !data) return back("error=save");
  // Already sent (perhaps from another tab): don't send a second copy.
  if (data.notified_at) return back("saved=alert");

  const sent = await notifyOwner(db, kind, data as RfqRow | ManufacturerRow);
  return back(sent ? "saved=alert" : "error=alert");
}
