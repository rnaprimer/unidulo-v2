import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { RfqForm } from "./rfq-form";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Send the size, material and quantity of the packaging you need.",
};

export default function Quote() {
  return (
    <>
      <PageIntro title="Request a quote">
        Five short steps. It&rsquo;s free, it doesn&rsquo;t commit you to an order, and you
        don&rsquo;t need artwork or a drawing to start.
      </PageIntro>
      <div className="mx-auto max-w-2xl px-5 py-12">
        <RfqForm />
      </div>
    </>
  );
}
