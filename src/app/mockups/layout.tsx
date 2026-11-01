import type { Metadata } from "next";

/** Comparison pages for choosing an art direction: never indexed. */
export const metadata: Metadata = {
  title: "Art-direction mock-ups",
  robots: { index: false, follow: false },
};

export default function MockupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
