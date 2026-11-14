// Small shared pieces of the public site's look: the arrow, the section label
// and the three kinds of button. Words and shapes only, no logic.

/** The small diagonal arrow that follows a link or sits in a button. Decorative. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 9.5l7-7M4 2.5h5.5V8" />
    </svg>
  );
}

/** The small capital-letter line above a section, such as "01 / Explore manufacturing". */
export function Label({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <p className="label flex items-center gap-2">
      {dot && <span className="size-1.5 rounded-full bg-lime ring-1 ring-charcoal/30" aria-hidden="true" />}
      {children}
    </p>
  );
}

const button = "inline-flex items-center justify-between gap-6 rounded-[3px] px-5 py-3 text-sm font-medium";

/** Charcoal with white text: the main button on light backgrounds. */
export const primaryButton = `${button} bg-charcoal text-white hover:bg-charcoal-hover`;
/** Lime with dark text: the main button on dark bands. */
export const limeButton = `${button} bg-lime text-charcoal hover:bg-white`;
/** A plain text link followed by an arrow: the secondary action. */
export const textLink =
  "inline-flex items-center gap-2.5 py-3 text-sm font-medium underline-offset-4 hover:underline";

/** The top of a numbered section: label and headline on the left, a short paragraph on the right. */
export function SectionHead({
  label,
  title,
  children,
}: {
  label: string;
  title: [string, string];
  children?: React.ReactNode;
}) {
  return (
    <div className="grid items-end gap-x-12 gap-y-6 md:grid-cols-[3fr_2fr]">
      <div>
        <Label>{label}</Label>
        <h2 className="display mt-6 text-3xl sm:text-4xl">
          {title[0]}
          <br />
          {title[1]}
        </h2>
      </div>
      {children && <div className="max-w-[42ch] text-sm leading-relaxed text-soft md:justify-self-end">{children}</div>}
    </div>
  );
}

/** A small line drawing. Decorative only. */
export function Icon({ children, size = 22 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** The plus sign on an expandable row. It turns into a cross when the row is open. */
export function Plus() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="11"
      height="11"
      aria-hidden="true"
      className="shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    >
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

/** How an expandable row's heading line is laid out. The browser's own triangle is hidden. */
export const summaryRow =
  "flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden";
