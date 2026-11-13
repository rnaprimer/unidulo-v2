import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "How it works",
  description: "The steps from sending a packaging request to receiving your order.",
};

const steps = [
  {
    title: "You send a request",
    body: "Fill in the type of packaging, its size, material, printing, quantity and where it should be delivered. You get a reference number straight away.",
  },
  {
    title: "We review it",
    body: "A person reads every request. If something is missing or a different board or print method would suit the job better, we get in touch to sort it out.",
  },
  {
    title: "We collect factory quotes",
    body: "We ask manufacturers that suit your quantity and specification, and compare their prices, minimums and lead times on equal terms.",
  },
  {
    title: "You get one quotation",
    body: "It states the specification, unit and total price, taxes, delivery, timeline and how long the price is valid. You can accept it, decline it or ask for changes.",
  },
  {
    title: "Sample, if the job needs one",
    body: "For printed or structural work, the factory makes a sample for you to check before the full run. Production follows the version you approved.",
  },
  {
    title: "Production and checks",
    body: "We stay in contact with the factory during the run and tell you where things stand. Before dispatch the goods are checked against the approved specification.",
  },
  {
    title: "Delivery",
    body: "We arrange transport to your address and confirm when it arrives. Your specification is kept, so a repeat order doesn't start from zero.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <PageIntro title="From request to delivery">
        Unidulo is a managed service: you deal with us, and we deal with the factory. Here is
        what happens after you send a request.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <ol className="max-w-3xl">
          {steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-6">
              <span className="display flex size-10 items-center justify-center rounded-full bg-lime text-xl" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 max-w-3xl rounded-sm border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Good to know before you start</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>Sending a request is free and doesn&rsquo;t commit you to an order.</li>
            <li>
              Small quantities are possible for many products, but not all. If your quantity is
              below what any suitable factory will run, we&rsquo;ll say so and suggest options.
            </li>
            <li>
              We can&rsquo;t take artwork files through the website yet. Once we&rsquo;ve reviewed
              your request, we&rsquo;ll arrange how to receive them.
            </li>
          </ul>
        </div>

        <Link
          href="/quote"
          className="mt-10 inline-block rounded-sm bg-action px-5 py-3 font-medium text-white hover:bg-action-hover"
        >
          Request a quote
        </Link>
      </div>
    </>
  );
}
