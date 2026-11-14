// What Unidulo makes today (packaging) and what is planned.
// This is words and drawings only. Nothing here feeds a form, the database or
// the console: the list of things a visitor can order lives in src/lib/schemas.ts.
import Link from "next/link";

// Each planned capability: its name, one sentence saying what the process is,
// and the lines of its small drawing.
const planned = [
  {
    name: "CNC machining",
    body: "Cutting metal or plastic parts from a solid block with computer-controlled tools.",
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
    body: "Making plastic parts by injecting molten plastic into a shaped mould.",
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
    body: "Building a part layer by layer from a digital design.",
    icon: (
      <>
        <path d="M9 2h6v3l-3 3-3-3z" />
        <path d="M8 12h8M6 16h12M4 20h16" />
      </>
    ),
  },
  {
    name: "Sheet metal fabrication",
    body: "Cutting, bending and joining flat metal sheet into parts and enclosures.",
    icon: <path d="M3 16h7l4-9h7v3h-5l-4 9H3z" />,
  },
  {
    name: "Plastics manufacturing",
    body: "Forming plastic into products by processes such as extrusion and thermoforming.",
    icon: (
      <>
        <path d="M10 2h4v3l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8l2-3z" />
        <path d="M8 13h8" />
      </>
    ),
  },
  {
    name: "Silicone components",
    body: "Flexible moulded parts such as seals, gaskets and keypads.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
      </>
    ),
  },
];

/** A small line drawing, in the same pen as the box drawing at the top of the page. Decorative only. */
function Icon({ children, size = 28 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** The label on everything that cannot be ordered yet. Always words, never colour alone. */
function ComingSoon() {
  return (
    <span className="inline-block rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-ink">
      Coming soon
    </span>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-6 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="display text-3xl">What Unidulo makes, and what&rsquo;s next</h2>
        <p className="mt-4 max-w-[62ch] text-muted">
          Packaging boxes are available to order today. Everything else on this list is planned
          and can&rsquo;t be ordered yet.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Packaging: the one thing that is live. Two columns wide on desktop. */}
          <li className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-sm border border-t-[3px] border-line border-t-lime bg-surface p-6 lg:w-[calc((200%_-_1.25rem)/3)]">
              <div className="flex items-start justify-between gap-4">
                <Icon size={40}>
                  <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                  <path d="M3 7.5 12 12l9-4.5M12 12v9" />
                </Icon>
                <span className="inline-block rounded-full bg-lime px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink">
                  Available now
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Packaging boxes</h3>
              <p className="mt-2 max-w-[56ch] text-muted">
                Custom paper and board packaging, such as shipping boxes, mailer boxes and folding
                cartons, made to your size, material and print.
              </p>
              <Link
                href="/quote"
                className="mt-5 inline-block rounded-sm bg-action px-5 py-3 font-medium text-white hover:bg-action-hover"
              >
                Request a quote
              </Link>
            </div>
          </li>

          {/* Planned: plain content. Not links, not buttons. */}
          {planned.map((item) => (
            <li
              key={item.name}
              className="flex flex-col rounded-sm border border-dashed border-line p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <Icon>{item.icon}</Icon>
                <ComingSoon />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
