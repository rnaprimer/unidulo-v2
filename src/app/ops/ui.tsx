"use client";

// The only browser-side code in the console: a button that shows it is busy.
import { useFormStatus } from "react-dom";

export const opsButton =
  "rounded-sm bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-fold-dark disabled:cursor-not-allowed disabled:opacity-60";
export const opsQuietButton =
  "rounded-sm border border-ink px-3 py-2 text-sm font-medium hover:bg-paper disabled:opacity-60";
export const opsInput =
  "block w-full rounded-sm border border-line bg-surface px-2.5 py-2 text-base text-ink";

/** A submit button that disables itself and changes its label while the form is being saved. */
export function SubmitButton({
  children,
  busy = "Saving…",
  quiet = false,
}: {
  children: React.ReactNode;
  busy?: string;
  quiet?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={quiet ? opsQuietButton : opsButton}>
      {pending ? busy : children}
    </button>
  );
}
