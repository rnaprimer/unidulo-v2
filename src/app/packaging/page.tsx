import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Arrow, primaryButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Packaging",
  description: "The packaging types Unidulo quotes, and the details worth having ready.",
};

const types = [
  {
    name: "Corrugated shipping boxes",
    use: "Sending products by courier or freight.",
    specify: "Inside size, 3 or 5 ply, weight of the contents, any printing.",
  },
  {
    name: "Mailer boxes",
    use: "E-commerce orders and subscription kits that open like a lid.",
    specify: "Inside size, board, print on the outside, inside or both.",
  },
  {
    name: "Folding cartons",
    use: "Retail product boxes for cosmetics, food, electronics accessories.",
    specify: "Size, board type and thickness (GSM), print colours, finish.",
  },
  {
    name: "Rigid gift boxes",
    use: "Premium and gifting products that need a stiff, wrapped box.",
    specify: "Size, lid style, wrap paper, foil or embossing, inserts.",
  },
  {
    name: "Paper bags",
    use: "Retail carry bags and takeaway.",
    specify: "Width, gusset and height, paper weight, handle type, print.",
  },
  {
    name: "Sleeves, inserts and dividers",
    use: "Branding around a plain box, or holding products in place inside one.",
    specify: "Size of the box they fit, material, print.",
  },
];

const terms = [
  ["Ply", "The number of paper layers in corrugated board. 3 ply suits light products; 5 ply is for heavier loads."],
  ["GSM", "Grams per square metre: how heavy, and roughly how thick, a paper or board is."],
  ["Lamination", "A thin matte or gloss film over the print that protects it and changes the feel."],
  ["Dieline", "The flat drawing of a box showing where it is cut and folded. The factory can prepare one from your sizes."],
  ["MOQ", "Minimum order quantity: the smallest run a factory will make at a workable price."],
];

export default function Packaging() {
  return (
    <>
      <PageIntro label="Available today" title="Packaging we quote">
        Paper and board packaging, made to your size and printed with your branding. You
        don&rsquo;t need to know every detail. Tell us what you know and we&rsquo;ll ask about
        the rest.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-charcoal">
                <th className="label py-3 pr-6">Type</th>
                <th className="label py-3 pr-6">Typically used for</th>
                <th className="label py-3">Useful to tell us</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.name} className="border-b border-hair align-top text-sm leading-relaxed">
                  <th scope="row" className="py-5 pr-6 text-base font-medium">{t.name}</th>
                  <td className="py-5 pr-6 text-soft">{t.use}</td>
                  <td className="py-5 text-soft">{t.specify}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="display mt-16 text-3xl">Terms you&rsquo;ll see in the request form</h2>
        <dl className="mt-8 max-w-3xl border-t border-hair text-sm leading-relaxed">
          {terms.map(([term, meaning]) => (
            <div key={term} className="grid gap-x-6 border-b border-hair py-4 sm:grid-cols-[8rem_1fr]">
              <dt className="font-medium">{term}</dt>
              <dd className="text-soft">{meaning}</dd>
            </div>
          ))}
        </dl>

        <Link href="/quote" className={`${primaryButton} mt-12`}>
          Request a quote
          <Arrow />
        </Link>
      </div>
    </>
  );
}
