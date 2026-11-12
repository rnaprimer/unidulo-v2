// Pieces used by both console pages: the top bar and how dates are written.
import Link from "next/link";
import { signOut } from "./actions";
import { SubmitButton } from "./ui";

export function OpsHeader() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <Link href="/ops" className="display text-xl">
        Operations
      </Link>
      <form action={signOut}>
        <SubmitButton quiet busy="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}

export function Loading({ what }: { what: string }) {
  return (
    <p role="status" className="py-8 text-muted">
      Loading {what}…
    </p>
  );
}

const india = { timeZone: "Asia/Kolkata" } as const;

/** A moment in time, shown in India time: "12 Nov 2026, 6:21 pm". */
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { ...india, dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/** A calendar date stored as YYYY-MM-DD, shown as "12 Nov 2026". No time zone is involved. */
export const formatDate = (day: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", dateStyle: "medium" }).format(new Date(`${day}T00:00:00Z`));

export function StatusTag({ status }: { status: string }) {
  return (
    <span className="inline-block rounded-sm border border-line bg-paper px-1.5 py-0.5 text-xs font-medium">
      {status}
    </span>
  );
}

export function OverdueTag() {
  return (
    <span className="inline-block rounded-sm border border-error px-1.5 py-0.5 text-xs font-semibold text-error">
      Overdue
    </span>
  );
}
