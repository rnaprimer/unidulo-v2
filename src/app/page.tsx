import Link from "next/link";
import { Capabilities } from "@/components/capabilities";
import { Dieline } from "@/components/dieline";
import { TrackingPreview } from "@/components/tracking-preview";
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
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[5fr_6fr] md:py-20">
        <div>
          <h1 className="display text-4xl sm:text-5xl">
            Custom manufacturing, made to your spec.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-muted">
            Tell us the size, material and quantity. Unidulo finds a manufacturer in India that
            fits the job and manages the order with you, from quote to delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-sm bg-action px-5 py-3 font-medium text-white hover:bg-action-hover"
            >
              Request a quote
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-sm border border-ink px-5 py-3 font-medium hover:bg-surface"
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-surface p-4 sm:p-6">
          <Dieline />
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
