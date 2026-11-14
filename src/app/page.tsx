import Image from "next/image";
import Link from "next/link";
import { Capabilities } from "@/components/capabilities";
import { ClosingBand, PackagingSwitcher, Process, Promises, Questions } from "@/components/home-sections";
import { Arrow, Label, primaryButton, textLink } from "@/components/ui";

export default function Home() {
  return (
    <>
      {/* Hero */}
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

        {/* The photograph shows more than packaging, so it is labelled as an illustration
            and the card under it says what can and cannot be ordered. */}
        <div className="relative overflow-hidden rounded-[3px] border border-hair bg-band">
          <Image
            src="/hero.webp"
            alt="A cardboard box beside a machined metal block, a plastic enclosure, a bent metal bracket, a 3D printed part and a rubber ring"
            width={1536}
            height={1024}
            priority
            sizes="(min-width: 768px) 560px, 100vw"
            className="aspect-[3/2] w-full object-cover"
          />
          <p className="label absolute top-4 left-4 rounded-full bg-white px-2.5 py-1 !text-charcoal">
            Illustration
          </p>
          <div className="bg-white px-5 py-4 sm:px-6 sm:py-5">
            <p className="label">The possibilities of manufacturing</p>
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
