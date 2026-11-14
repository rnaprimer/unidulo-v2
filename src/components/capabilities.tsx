// Section 01 on the home page: what Unidulo makes today (packaging) and what is planned.
// This is words and drawings only. Nothing here feeds a form, the database or
// the console: the list of things a visitor can order lives in src/lib/schemas.ts.
import Link from "next/link";
import { Arrow, Icon, SectionHead } from "./ui";

// Each planned capability: its name, one short line saying what it is,
// and the lines of its small drawing.
const planned = [
  {
    name: "CNC machining",
    body: "Precision parts, cut from solid metal or plastic.",
    icon: (
      <>
        <rect x="9" y="2" width="6" height="6" />
        <path d="M12 8v6" />
        <path d="M3 14h6v3h6v-3h6v6H3z" />
      </>
    ),
  },
  {
    name: "Injection moulding",
    body: "Plastic parts made by injecting molten plastic into a mould.",
    icon: (
      <>
        <rect x="3" y="6" width="7" height="14" />
        <rect x="14" y="6" width="7" height="14" />
        <path d="M10 10H8v6h2M14 10h2v6h-2M12 2v6" />
      </>
    ),
  },
  {
    name: "3D printing",
    body: "Parts built layer by layer from a digital design.",
    icon: (
      <>
        <path d="M9 2h6v3l-3 3-3-3z" />
        <path d="M8 12h8M6 16h12M4 20h16" />
      </>
    ),
  },
  {
    name: "Sheet metal fabrication",
    body: "Cut, bent and formed parts and enclosures.",
    icon: <path d="M3 16h7l4-9h7v3h-5l-4 9H3z" />,
  },
  {
    name: "Plastics manufacturing",
    body: "Formed and fabricated products in plastic.",
    icon: (
      <>
        <path d="M10 2h4v3l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8l2-3z" />
        <path d="M8 13h8" />
      </>
    ),
  },
  {
    name: "Silicone components",
    body: "Flexible parts, seals and custom components.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
      </>
    ),
  },
];

/** The label on everything that cannot be ordered yet. Always words, never colour alone. */
function ComingSoon() {
  return (
    <span className="rounded-full border border-hair px-2 py-0.5 text-[11px] whitespace-nowrap text-soft">
      Coming soon
    </span>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-6">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead label="01 / Explore manufacturing" title={["Different processes.", "One manufacturing partner."]}>
          We&rsquo;re building one place to get custom products made, across materials and
          processes. Start with packaging today. More capabilities are planned.
        </SectionHead>

        {/* One grid with hairlines between the cells: the 1px gaps show the colour behind. */}
        <ul className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4">
          {/* Packaging: the one thing that is live. Two cells wide. */}
          <li className="bg-sage p-6 sm:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <Icon size={26}>
                <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                <path d="M3 7.5 12 12l9-4.5M12 12v9" />
              </Icon>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-lime ring-1 ring-charcoal/40" aria-hidden="true" />
                Available now
              </span>
            </div>
            <h3 className="mt-8 text-2xl tracking-tight">Custom packaging</h3>
            <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-soft">
              Boxes, cartons, bags, sleeves and inserts. Paper and board, made to your
              specifications.
            </p>
            <Link
              href="/packaging"
              className="mt-6 inline-flex items-center gap-2.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Explore packaging
              <Arrow />
            </Link>
          </li>

          {/* Planned: plain content. Not links, not buttons, no hover effect. */}
          {planned.map((item) => (
            <li key={item.name} className="bg-page p-6">
              <div className="flex items-start justify-between gap-3 text-soft">
                <Icon>{item.icon}</Icon>
                <ComingSoon />
              </div>
              <h3 className="mt-8 font-medium">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-soft">{item.body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-soft">
          Packaging is available to order. All other processes shown are coming soon and are not
          yet available for quotes.
        </p>
      </div>
    </section>
  );
}
