import Link from "next/link";
import { Capabilities } from "@/components/capabilities";
import { Dieline } from "@/components/dieline";
import { ClosingBand, PackagingSwitcher, Process, Promises, Questions } from "@/components/home-sections";
import { Arrow, Label, primaryButton, textLink } from "@/components/ui";

export default function Home() {
  return (
    <>
      {/* Hero. The picture panel holds the box drawing until the photograph is supplied. */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:py-20">
        <div>
          <Label dot>Custom manufacturing. Simplified.</Label>
          <h1 className="display mt-6 text-[2.75rem] sm:text-6xl">
            Manufacturing.
            <br />
            Made simple.
          </h1>
          <p className="mt-7 max-w-[34ch] text-lg leading-snug">
            One place for custom manufacturing. One partner to manage the details.
          </p>
          <p className="mt-4 max-w-[44ch] text-sm text-soft">
            Packaging is available today. CNC machining, injection moulding, 3D printing and more
            are coming soon.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2">
            <a href="#capabilities" className={primaryButton}>
              Explore capabilities
              <Arrow className="rotate-90" />
            </a>
            <Link href="/quote" className={textLink}>
              Packaging quote
              <Arrow />
            </Link>
          </div>
          <p className="mt-8 text-xs text-soft">Made for businesses across India.</p>
        </div>

        <div className="rounded-[3px] border border-hair bg-band p-4 sm:p-6">
          <Label dot>The possibilities of manufacturing</Label>
          <div className="mt-4 rounded-[3px] bg-white p-3 sm:p-5">
            <Dieline />
          </div>
          <div className="mt-4 rounded-[3px] bg-white px-5 py-4">
            <p className="label">What you can order</p>
            <p className="mt-2 text-lg">Many processes. One vision.</p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-hair pt-3 text-xs text-soft">
              <span>Packaging: Available now</span>
              <span>Other processes: Coming soon</span>
            </p>
          </div>
        </div>
      </section>

      <Promises />
      <Capabilities />
      <PackagingSwitcher />
      <Process />
      <Questions />
      <ClosingBand />
    </>
  );
}
