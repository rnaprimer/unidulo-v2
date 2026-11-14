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
