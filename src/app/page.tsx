import Link from "next/link";
import { Capabilities } from "@/components/capabilities";
import { Dieline } from "@/components/dieline";
import { TrackingPreview } from "@/components/tracking-preview";
import { Arrow, Label, primaryButton, textLink } from "@/components/ui";
import { PACKAGING_TYPES } from "@/lib/schemas";

const handled = [
  {
    title: "Finding the right factory",
    body: "A plant built for runs of 50,000 is the wrong place for 500 boxes. We look for a manufacturer whose machines, materials and minimums fit your order.",
  },
  {
    title: "Quotes you can compare",
    body: "Factories quote on different assumptions. We put them on the same footing (same board, same print, same delivery terms) before you see a price.",
  },
  {
    title: "Following the order through",
    body: "Samples, approvals, production, checks before dispatch and transport are coordinated by one person, so you aren't chasing four.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero. The picture panel holds the box drawing until the photograph is supplied. */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:py-20">
        <div>
          <Label dot>Custom manufacturing. Simplified.</Label>
          <h1 className="display mt-6 text-[2.75rem] sm:text-6xl">
            Manufacturing.
            <br />
            Made simple.
          </h1>
          <p className="mt-7 max-w-[34ch] text-lg leading-snug">
            One place for custom manufacturing. One partner to manage the details.
          </p>
          <p className="mt-4 max-w-[44ch] text-sm text-soft">
            Packaging is available today. CNC machining, injection moulding, 3D printing and more
            are coming soon.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2">
            <a href="#capabilities" className={primaryButton}>
              Explore capabilities
              <Arrow className="rotate-90" />
            </a>
            <Link href="/quote" className={textLink}>
              Packaging quote
              <Arrow />
            </Link>
          </div>
          <p className="mt-8 text-xs text-soft">Made for businesses across India.</p>
        </div>

        <div className="rounded-[3px] border border-hair bg-band p-4 sm:p-6">
          <Label dot>The possibilities of manufacturing</Label>
          <div className="mt-4 rounded-[3px] bg-white p-3 sm:p-5">
            <Dieline />
          </div>
          <div className="mt-4 rounded-[3px] bg-white px-5 py-4">
            <p className="label">What you can order</p>
            <p className="mt-2 text-lg">Many processes. One vision.</p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-hair pt-3 text-xs text-soft">
              <span>Packaging: Available now</span>
              <span>Other processes: Coming soon</span>
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="display max-w-[24ch] text-3xl">
            Ordering packaging usually means doing a buyer&rsquo;s job yourself.
          </h2>
          <p className="mt-4 max-w-[62ch] text-muted">
            Calling factories, explaining the same box again, sending drawings over WhatsApp,
            negotiating minimums and following up on dates. Unidulo takes that work on.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {handled.map((item) => (
              <div key={item.title} className="border-t-2 border-ink pt-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrackingPreview />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="display text-3xl">What you can ask us to quote</h2>
            <p className="mt-4 text-muted">
              We&rsquo;re starting with paper and board packaging. If yours isn&rsquo;t listed,
              describe it in the request and we&rsquo;ll tell you whether we can help.
            </p>
            <Link href="/packaging" className="mt-5 inline-block font-medium text-action underline underline-offset-4">
              Packaging types and what to specify
            </Link>
          </div>
          <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2 sm:gap-x-8">
            {Object.entries(PACKAGING_TYPES)
              .filter(([key]) => key !== "other")
              .map(([key, label]) => (
                <li key={key} className="border-b border-line py-3">
                  {label}
                </li>
              ))}
          </ul>
        </div>
      </section>

      <Capabilities />

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Have a box in mind?</h2>
            <p className="mt-2 max-w-[52ch] text-white/75">
              The request takes about five minutes. You don&rsquo;t need a drawing or artwork to
              start, and rough sizes are fine.
            </p>
          </div>
          <Link
            href="/quote"
            className="rounded-sm bg-lime px-5 py-3 font-medium text-ink hover:bg-white"
          >
            Request a quote
          </Link>
        </div>
      </section>
    </>
  );
}
