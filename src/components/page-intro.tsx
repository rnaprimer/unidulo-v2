import { Label } from "./ui";

/** The top of every page except the home page: a small label, the headline and one paragraph. */
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-hair">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <Label dot>{label}</Label>
        <h1 className="display mt-6 max-w-[20ch] text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-6 max-w-[58ch] leading-relaxed text-soft">{children}</p>
      </div>
    </div>
  );
}
