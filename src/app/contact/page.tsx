import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Contact" };

// Shown only when an address has been set, so the page never lists a made-up one.
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Contact() {
  return (
    <>
      <PageIntro title="Contact Unidulo">
        The quickest way to reach us is through the form that matches what you need. Every
        submission is read by a person.
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-2">
        <Link href="/quote" className="rounded-sm border border-line bg-surface p-6 hover:border-ink">
          <h2 className="text-xl font-semibold">I need packaging made</h2>
          <p className="mt-2 text-muted">
            Send your size, material and quantity. We&rsquo;ll reply by email or phone.
          </p>
          <span className="mt-4 inline-block font-medium text-action underline underline-offset-4">
            Request a quote
          </span>
        </Link>
        <Link href="/manufacturers" className="rounded-sm border border-line bg-surface p-6 hover:border-ink">
          <h2 className="text-xl font-semibold">I run a packaging unit</h2>
          <p className="mt-2 text-muted">
            Tell us what you make and your minimums, and we&rsquo;ll be in touch about suitable
            enquiries.
          </p>
          <span className="mt-4 inline-block font-medium text-action underline underline-offset-4">
            Apply as a manufacturer
          </span>
        </Link>
        <div className="text-muted md:col-span-2">
          <p>Unidulo is based in Bhubaneswar, Odisha, India.</p>
          {email && (
            <p className="mt-1">
              For anything else, email{" "}
              <a href={`mailto:${email}`} className="text-action underline underline-offset-4">
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
