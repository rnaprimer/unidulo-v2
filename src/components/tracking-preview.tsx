// A preview of order tracking, which is planned and NOT built.
// This is a picture made of words and shapes. There is no tracking page, no
// order data and nothing to click. The order shown is an illustration, not a real one.
import { Icon } from "./ui";

const stages = [
  { name: "Order confirmed", state: "done" },
  { name: "Sample approved", state: "done" },
  { name: "In production", state: "current" },
  { name: "Quality check and dispatch", state: "upcoming" },
] as const;

type State = (typeof stages)[number]["state"];

/** The round marker beside a stage: a tick when done, a ringed dot when current, hollow when upcoming. */
function Marker({ state }: { state: State }) {
  if (state === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-lime" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-charcoal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <span className="pulse absolute inset-0 rounded-full border-2 border-lime" />
        <span className="flex size-5 items-center justify-center rounded-full border-2 border-lime">
          <span className="size-2 rounded-full bg-lime" />
        </span>
      </span>
    );
  }
  return <span className="size-5 shrink-0 rounded-full border-2 border-white/40" aria-hidden="true" />;
}

export function TrackingPreview() {
  return (
    <div className="rounded-[3px] border-t-[3px] border-lime bg-charcoal p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label !text-white/70">A clearer view of your order</p>
        <span className="rounded-full border border-white/40 px-2 py-0.5 text-[11px] whitespace-nowrap">
          Coming soon
        </span>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h3 className="display text-2xl sm:text-3xl">
          Every stage.
          <br />
          One place.
        </h3>
        <span className="text-white/70">
          <Icon size={30}>
            <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
            <path d="M3 7.5 12 12l9-4.5M12 12v9" />
          </Icon>
        </span>
      </div>
      <p className="mt-3 text-xs text-white/70">Illustrative order &middot; 500 mailer boxes</p>

      <ol className="mt-7">
        {stages.map((stage, i) => {
          const last = i === stages.length - 1;
          return (
            <li key={stage.name} className={`relative flex gap-4 ${last ? "" : "pb-6"}`}>
              {/* The line down to the next stage: solid once done, dashed when still ahead. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute top-5 bottom-0 left-[9px] border-l-2 ${
                    stage.state === "done" ? "border-lime" : "border-dashed border-white/25"
                  }`}
                />
              )}
              <Marker state={stage.state} />
              <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm leading-5">
                <span className={stage.state === "upcoming" ? "text-white/60" : ""}>{stage.name}</span>
                {stage.state === "done" && <span className="text-xs text-white/60">Complete</span>}
                {stage.state === "current" && (
                  <span className="rounded-full bg-lime px-2 text-xs font-medium text-charcoal">Current stage</span>
                )}
                {stage.state === "upcoming" && <span className="sr-only"> (upcoming)</span>}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-7 border-t border-white/15 pt-5 text-xs leading-relaxed text-white/70">
        Online tracking is on our roadmap; it isn&rsquo;t available yet. Today, we keep you
        updated by email and phone at each stage.
      </p>
    </div>
  );
}
