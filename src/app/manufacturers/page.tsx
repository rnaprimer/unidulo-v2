import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ManufacturerForm } from "./manufacturer-form";

export const metadata: Metadata = {
  title: "For manufacturers",
  description: "Packaging manufacturers in India can apply to receive enquiries from Unidulo.",
};

const points = [
  {
    title: "Enquiries with a full specification",
    body: "We settle size, material, printing, quantity and delivery with the customer before asking you for a price.",
  },
  {
    title: "One point of contact",
    body: "You deal with Unidulo for clarifications, approvals and dispatch, not with each customer separately.",
  },
  {
    title: "Only work that suits your unit",
    body: "Tell us what you make and your minimums. We don't send enquiries outside them.",
  },
];

export default function Manufacturers() {
  return (
    <>
      <PageIntro label="For manufacturers" title="Make packaging? Work with Unidulo.">
        We&rsquo;re building a network of packaging units across India, starting in Odisha and
        eastern India. Tell us about your unit and we&rsquo;ll get in touch.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-12 md:grid-cols-[2fr_3fr] md:py-16">
        <div className="border-b border-hair">
          {points.map((point) => (
            <div key={point.title} className="border-t border-hair py-6">
              <h2 className="font-medium">{point.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-soft">{point.body}</p>
            </div>
          ))}
          <p className="border-t border-hair py-6 text-sm text-soft">
            We are at an early stage and can&rsquo;t promise a volume of orders. Applying is
            free.
          </p>
        </div>
        <div className="rounded-[3px] border border-hair bg-white p-6 sm:p-10">
          <ManufacturerForm />
        </div>
      </div>
    </>
  );
}
