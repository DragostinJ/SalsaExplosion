import { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Create Free Student Account | Salsa Explosion UK",
  description:
    "Join Salsa Explosion UK to claim your Free Welcome Pass, book Cuban Casino classes at BOH Studios Bournemouth, and track your syllabus progression.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignUpPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <SignUp />
    </main>
  );
}

