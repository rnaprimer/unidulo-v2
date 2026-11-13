import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.unidulo.com"),
  title: { default: "Unidulo: custom manufacturing, made to your spec", template: "%s | Unidulo" },
  description:
    "Tell us the packaging you need. Unidulo finds a manufacturer in India that fits your size, material and quantity, and manages the order with you.",
};

const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/packaging", label: "Packaging" },
  { href: "/manufacturers", label: "For manufacturers" },
  { href: "/contact", label: "Contact" },
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-line bg-surface">
          {/* On phones: logo and quote button on one line, the links on a line below.
              From tablet width up: everything on one line. */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4">
            {/* The logo is a picture, so its alt text carries the name for screen readers. */}
            <Link href="/" className="shrink-0">
              <Image src="/logo.png" alt="Unidulo" width={614} height={144} priority className="h-7 w-auto" />
            </Link>
            <nav
              aria-label="Main"
              className="order-3 flex w-full flex-wrap justify-between gap-x-2.5 gap-y-2 border-t border-line pt-3 text-[13px] sm:justify-start sm:gap-x-6 sm:text-sm md:order-none md:w-auto md:flex-1 md:border-0 md:pt-0 md:text-[15px]"
            >
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="py-1 text-muted hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/quote"
              className="rounded-sm bg-action px-4 py-2 text-[15px] font-medium text-white hover:bg-action-hover"
            >
              Request a quote
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-5 py-8 text-sm text-muted">
            <p className="max-w-sm">
              Unidulo arranges custom packaging manufacturing for businesses in India. Based in
              Bhubaneswar, Odisha.
            </p>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/quote" className="hover:text-ink">Request a quote</Link>
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
