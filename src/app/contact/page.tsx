import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Arrow } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

// Shown only when an address has been set, so the page never lists a made-up one.
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Contact() {
  return (
    <>
      <PageIntro label="Contact" title="Contact Unidulo">
        The quickest way to reach us is through the form that matches what you need. Every
        submission is read by a person.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-2 md:py-16">
        <Link href="/quote" className="rounded-[3px] border border-hair bg-white p-6 hover:border-charcoal sm:p-8">
          <h2 className="display text-2xl">I need packaging made</h2>
          <p className="mt-3 text-sm leading-relaxed text-soft">
            Send your size, material and quantity. We&rsquo;ll reply by email or phone.
          </p>
          <span className="mt-6 inline-flex items-center gap-2.5 text-sm font-medium">
            Request a quote
            <Arrow />
          </span>
        </Link>
        <Link href="/manufacturers" className="rounded-[3px] border border-hair bg-white p-6 hover:border-charcoal sm:p-8">
          <h2 className="display text-2xl">I run a packaging unit</h2>
          <p className="mt-3 text-sm leading-relaxed text-soft">
            Tell us what you make and your minimums, and we&rsquo;ll be in touch about suitable
            enquiries.
          </p>
          <span className="mt-6 inline-flex items-center gap-2.5 text-sm font-medium">
            Apply as a manufacturer
            <Arrow />
          </span>
        </Link>
        <div className="text-sm text-soft md:col-span-2">
          <p>Unidulo is based in Bhubaneswar, Odisha, India.</p>
          {email && (
            <p className="mt-1">
              For anything else, email{" "}
              <a href={`mailto:${email}`} className="text-charcoal underline underline-offset-4">
                {email}
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </>
  );
}
