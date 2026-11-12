"use client";

// Shown when a console page fails to load, for example if the database can't be reached.
import { opsButton } from "./ui";

export default function OpsError({ error, retry }: { error: unknown; retry: () => void }) {
  const detail = error instanceof Error ? error.message : "";
  return (
    <div role="alert" className="rounded-sm border border-error bg-surface p-5">
      <h1 className="text-lg font-semibold text-error">This page couldn&rsquo;t load</h1>
      <p className="mt-2 text-muted">
        Nothing was changed. Try again, and if it keeps happening check that Supabase is running.
      </p>
      {detail && <p className="mt-2 text-sm text-muted">{detail}</p>}
      <button type="button" onClick={() => retry()} className={`${opsButton} mt-4`}>
        Try again
      </button>
    </div>
  );
}
