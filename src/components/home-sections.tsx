// The home page sections below the hero that are words only: the three-item
// strip, the packaging switcher, the process steps, the questions and the
// closing band. No logic and no data loading. Every sentence here restates
// something the rest of the site already says.
import Link from "next/link";
import { TrackingPreview } from "./tracking-preview";
import { Arrow, Icon, Label, limeButton, Plus, SectionHead, summaryRow } from "./ui";

/* ---------- The three-item strip under the hero ---------- */

const promises = [
  {
    text: "Built to your specifications",
    icon: <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5M9 12h6" />,
  },
  {
    text: "Matched to the right manufacturer",
    icon: <path d="M3 20V9l5 3V9l5 3V5h4l1 15zM3 20h18" />,
  },
  {
    text: "Managed from quote to delivery",
    icon: <path d="M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4" />,
  },
];

export function Promises() {
  return (
    <section className="mx-auto max-w-6xl px-5">
      <ul className="grid border-y border-hair text-sm sm:grid-cols-3">
        {promises.map((item, i) => (
          <li
            key={item.text}
            className={`flex items-center gap-3 py-5 ${
              i === 1 ? "sm:justify-center" : i === 2 ? "sm:justify-end" : ""
            } ${i > 0 ? "border-t border-hair sm:border-t-0" : ""}`}
          >
            <span className="text-soft">
              <Icon size={18}>{item.icon}</Icon>
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- 02: the packaging switcher ---------- */

// Five groups of packaging. "Used for" and "useful to tell us" repeat the table
// on the Packaging page.
const groups = [
  {
    name: "Mailer boxes",
    title: "An introduction worth opening.",
    use: "E-commerce orders and subscription kits that open like a lid.",
    tell: "Inside size, board, and print on the outside, inside or both.",
  },
  {
    name: "Shipping boxes",
    title: "Made for the journey.",
    use: "Sending products by courier or freight.",
    tell: "Inside size, 3 or 5 ply, weight of the contents, any printing.",
  },
  {
    name: "Folding cartons",
    title: "Made for the shelf.",
    use: "Retail product boxes for cosmetics, food and electronics accessories.",
    tell: "Size, board type and thickness (GSM), print colours, finish.",
  },
  {
    name: "Rigid & gift boxes",
    title: "For products worth presenting.",
    use: "Premium and gifting products that need a stiff, wrapped box.",
    tell: "Size, lid style, wrap paper, foil or embossing, inserts.",
  },
  {
    name: "Bags, sleeves & inserts",
    title: "The pieces around the box.",
    use: "Retail carry bags, branding around a plain box, and holding products in place inside one.",
    tell: "Size, material and print. For sleeves and inserts, the size of the box they fit.",
  },
];

/**
 * A list on the left that switches the panel on the right.
 * It is a group of radio buttons, so it works with the keyboard (arrow keys),
 * tells screen readers which one is chosen, and needs no JavaScript: the
 * stylesheet shows the panel that matches the chosen radio button.
 */
export function PackagingSwitcher() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <SectionHead label="02 / Available today" title={["Good packaging.", "Made for your product."]}>
        <p>
          From the first impression to the last mile. Custom paper and board packaging, made to
          your size, material and finish.
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sage px-2.5 py-0.5 text-[11px] font-medium text-charcoal">
          <span className="size-1.5 rounded-full bg-lime ring-1 ring-charcoal/40" aria-hidden="true" />
          Available to order
        </p>
      </SectionHead>

      <div className="switcher mt-12 grid gap-x-10 gap-y-8 border-t border-hair pt-8 md:grid-cols-2">
        <fieldset>
          <legend className="sr-only">Choose a type of packaging to read about</legend>
          {groups.map((group, i) => (
            <div key={group.name} className="relative border-b border-hair">
              <input
                type="radio"
                name="packaging-group"
                id={`pkg-${i}`}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <label
                htmlFor={`pkg-${i}`}
                className="flex cursor-pointer items-center gap-5 border-l-[3px] border-transparent px-4 py-4 text-sm peer-checked:border-lime peer-checked:bg-sage peer-checked:font-medium peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-charcoal hover:bg-band peer-checked:hover:bg-sage"
              >
                <span className="text-[11px] text-soft tabular-nums" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="flex-1">{group.name}</span>
                <Arrow className="text-soft" />
              </label>
            </div>
          ))}
          <p className="mt-6 text-xs text-soft">
            Don&rsquo;t have a drawing yet? Rough sizes and a description are a good place to
            start.
          </p>
        </fieldset>

        <div>
          {groups.map((group, i) => (
            <div key={group.name} className={`panel panel-${i} mb-4 rounded-[3px] bg-band p-6 sm:p-8`}>
              <Label>{group.name}</Label>
              <h3 className="display mt-5 max-w-[16ch] text-2xl sm:text-3xl">{group.title}</h3>
              <dl className="mt-8 grid gap-6 border-t border-hair pt-6 text-sm sm:grid-cols-2">
                <div>
                  <dt className="label">Typically used for</dt>
                  <dd className="mt-2 leading-relaxed">{group.use}</dd>
                </div>
                <div>
                  <dt className="label">Useful to tell us</dt>
                  <dd className="mt-2 leading-relaxed">{group.tell}</dd>
                </div>
              </dl>
              <Link
                href="/quote"
                className="mt-8 inline-flex items-center gap-2.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                Get a quote for {group.name.toLowerCase().replace("&", "and")}
                <Arrow />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 03: the process, with the tracking illustration ---------- */

// Three steps that shorten the seven on the How it works page.
const steps = [
  {
    title: "Tell us what you need",
    body: "Share the type of packaging, its size, material, printing, quantity and where it should be delivered. A person reads every request, and we get in touch if something is missing.",
  },
  {
    title: "Get a considered quote",
    body: "We ask manufacturers that suit your quantity and specification, and compare their prices, minimums and lead times on equal terms. You get one quotation to accept, decline or change.",
  },
  {
    title: "Approve. Then we coordinate.",
    body: "For printed or structural work, the factory makes a sample for you to check first. We stay in contact with the factory during the run, the goods are checked before dispatch, and we arrange transport to your address.",
  },
];

export function Process() {
  return (
    <section className="border-y border-hair bg-band">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead label="03 / A simpler process" title={["You have a business to run.", "We handle the making."]}>
          No endless factory calls. No comparing mismatched quotes. One point of contact, from
          your first brief to your finished order.
        </SectionHead>

        <div className="mt-12 grid items-start gap-x-10 gap-y-10 md:grid-cols-2">
          <div className="border-t border-hair">
            {steps.map((step, i) => (
              // Sharing one name means opening a step closes the others.
              <details key={step.title} name="process" open={i === 0} className="group border-b border-hair">
                <summary className={summaryRow}>
                  <span className="flex items-baseline gap-5">
                    <span className="text-[11px] text-soft tabular-nums" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <span className="font-medium">{step.title}</span>
                  </span>
                  <Plus />
                </summary>
                <p className="max-w-[52ch] pb-6 pl-9 text-sm leading-relaxed text-soft">{step.body}</p>
              </details>
            ))}
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-2.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              See every step
              <Arrow />
            </Link>
          </div>

          <TrackingPreview />
        </div>
      </div>
    </section>
  );
}

/* ---------- Questions ---------- */

const questions = [
  {
    q: "What do I need to request a quote?",
    a: "The type of packaging, its size, material, printing, quantity and where it should be delivered. Rough sizes are fine, and you don't need a drawing or artwork to start. Sending a request is free and doesn't commit you to an order.",
  },
  {
    q: "Is there a minimum order quantity?",
    a: "It depends on the product and the factory. Small quantities are possible for many products, but not all. If your quantity is below what any suitable factory will run, we'll say so and suggest options.",
  },
  {
    q: "Does Unidulo make the products itself?",
    a: "No. Unidulo is a managed service: we find a manufacturer in India whose machines, materials and minimums fit your order, and you deal with us while we deal with the factory.",
  },
  {
    q: "Can I order CNC or 3D printed parts?",
    a: "Not yet. Packaging is the only thing you can order today. CNC machining, 3D printing and the other processes shown are planned and can't be quoted or ordered.",
  },
];

export function Questions() {
  return (
    <section className="mx-auto grid max-w-6xl gap-x-10 gap-y-10 px-5 py-16 md:grid-cols-2 md:py-24">
      <div>
        <Label>A few things to know</Label>
        <h2 className="display mt-6 text-3xl sm:text-4xl">
          Let&rsquo;s make
          <br />
          it clear.
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          Get in touch
          <Arrow />
        </Link>
      </div>
      <div className="border-t border-hair">
        {questions.map((item) => (
          <details key={item.q} className="group border-b border-hair">
            <summary className={summaryRow}>
              <span className="font-medium">{item.q}</span>
              <Plus />
            </summary>
            <p className="max-w-[58ch] pb-6 text-sm leading-relaxed text-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------- The dark band at the bottom ---------- */

export function ClosingBand() {
  return (
    <section className="bg-charcoal text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 py-16">
        <div>
          <p className="label !text-white/70">Start with packaging</p>
          <h2 className="display mt-6 text-3xl sm:text-4xl">
            Your vision. Our mission.
            <br />
            Make manufacturing simple.
          </h2>
          <p className="mt-5 max-w-[52ch] text-sm text-white/70">
            Start your packaging project today. The request takes about five minutes, and rough
            sizes are fine.
          </p>
        </div>
        <Link href="/quote" className={limeButton}>
          Request a quote
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
