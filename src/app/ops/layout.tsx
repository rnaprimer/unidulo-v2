import type { Metadata } from "next";

// The owner's console. Search engines are told not to list any page under /ops.
// Who may see these pages is decided on the server by requireOwner(), not here.
export const metadata: Metadata = {
  title: "Operations",
  robots: { index: false, follow: false },
};

export default function OpsLayout({ children }: LayoutProps<"/ops">) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5">{children}</div>;
}
