import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  KINDS,
  isKind,
  isOverdue,
  labelFor,
  type Kind,
  type ManufacturerRow,
  type RfqRow,
} from "@/lib/records";
import { DIMENSION_BASIS, FINISHES, MATERIALS, PACKAGING_TYPES, PRINT_COLOURS, UNITS } from "@/lib/schemas";
import { getRecord } from "@/lib/server/ops";
import { addNote, resendAlert, updateNextAction, updateStatus } from "../../actions";
import { Loading, OpsHeader, OverdueTag, StatusTag, formatDate, formatDateTime } from "../../shared";
import { SubmitButton, opsInput } from "../../ui";

// One record: the original submission, then the things the owner can change.
export default function RecordPage(props: PageProps<"/ops/[kind]/[id]">) {
  return (
    <Suspense fallback={<Loading what="record" />}>
      <Detail {...props} />
    </Suspense>
  );
}

const SAVED: Record<string, string> = {
  status: "Status saved.",
  next: "Next action saved.",
  note: "Note added.",
  alert: "Alert email sent.",
};
const FAILED: Record<string, string> = {
  status: "That status isn't one of the allowed values. Nothing was changed.",
  next: "The next action must be under 200 characters with a valid date. Nothing was changed.",
  note: "A note needs some text, up to 4000 characters. Nothing was saved.",
  alert: "The alert email couldn't be sent. The record still shows it as not sent, so you can try again.",
  save: "That couldn't be saved. Try again.",
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const section = "mt-6 rounded-sm border border-line bg-surface p-4 sm:p-5";
const sectionTitle = "text-lg font-semibold";

async function Detail({ params, searchParams }: PageProps<"/ops/[kind]/[id]">) {
  const [{ kind, id }, query] = await Promise.all([params, searchParams]);
  if (!isKind(kind)) notFound();

  // getRecord checks the owner before it reads anything.
  const { row, notes } = await getRecord(kind, id);
  const saved = SAVED[one(query.saved) ?? ""];
  const failed = FAILED[one(query.error) ?? ""];
  const overdue = isOverdue(kind, row.status, row.next_action_due);
  const hidden = (
    <>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={row.id} />
    </>
  );

  return (
    <>
      <OpsHeader />
      <p className="text-sm">
        <Link href={kind === "rfq" ? "/ops" : "/ops?tab=manufacturer"} className="text-action underline underline-offset-4">
          ← {KINDS[kind].label}
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="display text-2xl">{row.reference}</h1>
        <StatusTag status={row.status} />
        {overdue && <OverdueTag />}
      </div>
      <p className="mt-1 text-sm text-muted">
        {KINDS[kind].singular}, received {formatDateTime(row.created_at)}. Last changed{" "}
        {formatDateTime(row.updated_at)}.
      </p>

      {failed && (
        <p role="alert" className="mt-4 rounded-sm border border-error bg-surface px-3 py-2 font-medium text-error">
          {failed}
        </p>
      )}
      {saved && !failed && (
        <p role="status" className="mt-4 rounded-sm border border-line bg-surface px-3 py-2 font-medium">
          {saved}
        </p>
      )}

      <section className={section} aria-labelledby="submission">
        <h2 id="submission" className={sectionTitle}>
          Original submission
        </h2>
        <p className="mt-1 text-sm text-muted">Exactly as it was sent. This part can&rsquo;t be edited.</p>
        <dl className="mt-3 border-t border-line">
          {submission(kind, row).map(([label, value]) => (
            <div key={label} className="grid gap-x-6 border-b border-line py-2 sm:grid-cols-[11rem_1fr]">
              <dt className="text-muted">{label}</dt>
              <dd className="whitespace-pre-wrap break-words">{value || <span className="text-muted">Not given</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-x-6 md:grid-cols-2">
        <section className={section} aria-labelledby="status">
          <h2 id="status" className={sectionTitle}>
            Status
          </h2>
          <form action={updateStatus} className="mt-3 flex flex-wrap items-end gap-3">
            {hidden}
            <div className="min-w-40 flex-1">
              <label htmlFor="status-select" className="text-sm font-medium">
                Change to
              </label>
              <select id="status-select" name="status" defaultValue={row.status} className={`${opsInput} mt-1`}>
                {KINDS[kind].statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <SubmitButton>Save status</SubmitButton>
          </form>
        </section>

        <section className={section} aria-labelledby="alert">
          <h2 id="alert" className={sectionTitle}>
            Alert email
          </h2>
          {row.notified_at ? (
            <p className="mt-3 text-muted">Sent to you on {formatDateTime(row.notified_at)}.</p>
          ) : (
            <form action={resendAlert} className="mt-3 space-y-3">
              {hidden}
              <p className="font-medium text-error">The alert email for this record did not go out.</p>
              <SubmitButton busy="Sending…">Resend alert email</SubmitButton>
            </form>
          )}
        </section>
      </div>

      <section className={section} aria-labelledby="next">
        <h2 id="next" className={sectionTitle}>
          Next action
        </h2>
        <form action={updateNextAction} className="mt-3 grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
          {hidden}
          <div>
            <label htmlFor="next-action" className="text-sm font-medium">
              What needs doing
            </label>
            <input
              id="next-action"
              name="next_action"
              type="text"
              maxLength={200}
              defaultValue={row.next_action}
              className={`${opsInput} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="next-due" className="text-sm font-medium">
              Due date
            </label>
            <input
              id="next-due"
              name="next_action_due"
              type="date"
              defaultValue={row.next_action_due ?? ""}
              className={`${opsInput} mt-1`}
            />
          </div>
          <SubmitButton>Save next action</SubmitButton>
        </form>
        <p className="mt-2 text-sm text-muted">Empty both boxes and save to clear it.</p>
      </section>

      <section className={section} aria-labelledby="notes">
        <h2 id="notes" className={sectionTitle}>
          Notes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Private to this console. Never shown on the website or put in an email.
        </p>
        <form action={addNote} className="mt-3 space-y-3">
          {hidden}
          <label htmlFor="note-body" className="text-sm font-medium">
            Add a note
          </label>
          <textarea id="note-body" name="body" rows={3} maxLength={4000} required className={opsInput} />
          <SubmitButton>Add note</SubmitButton>
        </form>
        {notes.length === 0 ? (
          <p className="mt-4 text-muted">No notes yet.</p>
        ) : (
          <ol className="mt-4 border-t border-line">
            {notes.map((note) => (
              <li key={note.id} className="border-b border-line py-3">
                <p className="text-sm text-muted">{formatDateTime(note.created_at)}</p>
                <p className="mt-1 whitespace-pre-wrap break-words">{note.body}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

/** Every field the person filled in, in the order the form asked for them. */
function submission(kind: Kind, row: RfqRow | ManufacturerRow): [string, React.ReactNode][] {
  const contact: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${row.email}`} className="text-action underline underline-offset-4">{row.email}</a>],
    ["Phone", <a key="p" href={`tel:${row.phone}`} className="text-action underline underline-offset-4">{row.phone}</a>],
  ];
  if (kind === "rfq") {
    const r = row as RfqRow;
    return [
      ["Packaging", labelFor(PACKAGING_TYPES, r.packaging_type)],
      ["What goes inside", r.intended_use],
      ["Size", `${r.length} × ${r.width} × ${r.height} ${labelFor(UNITS, r.unit)}`],
      ["Sizes are for the", labelFor(DIMENSION_BASIS, r.dimension_basis)],
      ["Material", labelFor(MATERIALS, r.material)],
      ["Printing", labelFor(PRINT_COLOURS, r.print_colours)],
      ["Finishing", r.finishing.map((f) => labelFor(FINISHES, f)).join(", ") || "None"],
      ["Quantity", r.quantity.toLocaleString("en-IN")],
      ["Deliver to", `${r.delivery_city}, ${r.delivery_state}`],
      ["Needed by", r.required_by ? formatDate(r.required_by) : "No fixed date"],
      ["Customer's notes", r.notes],
      ["Name", r.contact_name],
      ["Company", r.company],
      ...contact,
    ];
  }
  const m = row as ManufacturerRow;
  return [
    ["Company", m.company_name],
    ["Contact name", m.contact_name],
    ...contact,
    ["Factory location", `${m.city}, ${m.state}`],
    ["Makes", m.products.map((p) => labelFor(PACKAGING_TYPES, p)).join(", ")],
    ["Smallest order", m.minimum_order],
    ["Machines and capabilities", m.capabilities],
  ];
}
