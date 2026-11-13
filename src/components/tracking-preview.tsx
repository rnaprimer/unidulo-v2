// A preview of order tracking, which is planned and NOT built.
// This is a picture made of words and shapes. There is no tracking page, no
// order data and nothing to click. The order shown is an example, not a real one.

const stages = [
  { name: "Order confirmed", state: "done" },
  { name: "Sample approved", state: "done" },
  { name: "In production", state: "done" },
  { name: "Quality check", state: "current" },
  { name: "Dispatched", state: "upcoming" },
  { name: "Delivered", state: "upcoming" },
] as const;

type State = (typeof stages)[number]["state"];

/** The round marker beside a stage: a tick when done, a ringed dot when current, hollow when upcoming. */
function Marker({ state }: { state: State }) {
  if (state === "done") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-action" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
        <span className="pulse absolute inset-0 rounded-full border-2 border-action" />
        <span className="flex size-6 items-center justify-center rounded-full border-2 border-action bg-surface">
          <span className="size-2.5 rounded-full bg-action" />
        </span>
      </span>
    );
  }
  return <span className="size-6 shrink-0 rounded-full border-2 border-muted bg-surface" aria-hidden="true" />;
}

export function TrackingPreview() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h2 className="display text-3xl">Follow your order like a parcel</h2>
            <span className="inline-block rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-ink">
              Coming soon
            </span>
          </div>
          <p className="mt-4 max-w-[52ch] text-muted">
            Once an order is placed, you&rsquo;ll be able to see which stage it has reached, from
            sample approval to delivery, without calling anyone. This is planned; it isn&rsquo;t
            available yet.
          </p>
          <p className="mt-6 max-w-[52ch] border-l-[3px] border-lime pl-3 font-medium">
            Today, we send you updates by email and phone at each stage.
          </p>
        </div>

        {/* The example panel. Plain content: an ordered list, nothing to click. */}
        <div className="rounded-sm border border-t-[3px] border-line border-t-lime bg-surface">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Example order</p>
            <p className="font-semibold">500 mailer boxes</p>
          </div>
          <ol className="px-5 py-5">
            {stages.map((stage, i) => {
              const last = i === stages.length - 1;
              return (
                <li key={stage.name} className={`relative flex gap-4 ${last ? "" : "pb-6"}`}>
                  {/* The line down to the next stage: solid once done, dashed when still ahead. */}
                  {!last && (
                    <span
                      aria-hidden="true"
                      className={`absolute top-6 bottom-0 left-[11px] border-l-2 ${
                        stage.state === "done" ? "border-action" : "border-dashed border-line"
                      }`}
                    />
                  )}
                  <Marker state={stage.state} />
                  <div className="leading-6">
                    {stage.state === "current" ? (
                      <>
                        <span className="font-bold">{stage.name}</span>
                        <span className="mt-1 inline-block rounded-full bg-lime px-2 text-sm font-medium text-ink">Current stage</span>
                      </>
                    ) : (
                      <>
                        <span className={stage.state === "done" ? "font-medium" : "text-muted"}>
                          {stage.name}
                        </span>
                        <span className="sr-only">{stage.state === "done" ? " (done)" : " (upcoming)"}</span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
