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
      <PageIntro title="Make packaging? Work with Unidulo.">
        We&rsquo;re building a network of packaging units across India, starting in Odisha and
        eastern India. Tell us about your unit and we&rsquo;ll get in touch.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          {points.map((point) => (
            <div key={point.title} className="border-t-2 border-ink pt-4">
              <h2 className="text-lg font-semibold">{point.title}</h2>
              <p className="mt-2 text-muted">{point.body}</p>
            </div>
          ))}
          <p className="text-sm text-muted">
            We are at an early stage and can&rsquo;t promise a volume of orders. Applying is
            free.
          </p>
        </div>
        <ManufacturerForm />
      </div>
    </>
  );
}
