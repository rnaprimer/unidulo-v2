import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Arrow, primaryButton } from "@/components/ui";
import "./globals.css";

// The site's typeface. Next.js downloads it when the site is built and serves
// it from our own address, so visitors never contact Google.
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.unidulo.com"),
  title: { default: "Unidulo: custom manufacturing, made to your spec", template: "%s | Unidulo" },
  description:
    "Tell us the packaging you need. Unidulo finds a manufacturer in India that fits your size, material and quantity, and manages the order with you.",
};

const nav = [
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/packaging", label: "Packaging" },
  { href: "/manufacturers", label: "For manufacturers" },
] as const;

const footerNav = [...nav, { href: "/contact", label: "Contact" }] as const;

function Logo({ className }: { className: string }) {
  // The logo is a picture, so its alt text carries the name for screen readers.
  return <Image src="/logo.png" alt="Unidulo" width={614} height={144} priority className={className} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} h-full antialiased`}>
      <body id="top" className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-hair bg-page">
          {/* On phones: logo and quote button on one line, the links on a line below.
              From tablet width up: everything on one line, links pushed to the right. */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4">
            <Link href="/" className="shrink-0">
              <Logo className="h-7 w-auto" />
            </Link>
            <nav
              aria-label="Main"
              className="order-3 flex w-full flex-wrap justify-between gap-x-2.5 gap-y-2 border-t border-hair pt-3 text-[13px] sm:justify-start sm:gap-x-7 md:order-none md:w-auto md:flex-1 md:justify-end md:border-0 md:pt-0"
            >
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="py-1 text-soft hover:text-charcoal">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/quote" className={`${primaryButton} !py-2.5`}>
              Request a quote
              <Arrow />
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-hair bg-page">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 md:grid-cols-[2fr_2fr_1fr]">
            <div>
              <Logo className="h-7 w-auto" />
              <p className="mt-4 max-w-[26ch] text-sm text-soft">Custom manufacturing. Made simple.</p>
            </div>
            <nav aria-label="Footer" className="grid max-w-xs grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {footerNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-soft hover:text-charcoal">
                  {item.label}
                </Link>
              ))}
              <Link href="/quote" className="text-soft hover:text-charcoal">
                Request a quote
              </Link>
            </nav>
            <div className="text-sm">
              <p className="label">Based in</p>
              <p className="mt-3">Bhubaneswar, Odisha, India</p>
            </div>
          </div>
          <div className="border-t border-hair">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-5 text-xs text-soft">
              <p>&copy; 2026 Unidulo. All rights reserved.</p>
              <a href="#top" className="inline-flex items-center gap-2 hover:text-charcoal">
                Back to top
                <Arrow className="-rotate-45" />
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
