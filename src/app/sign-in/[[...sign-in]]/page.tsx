import { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In to Member Portal | Salsa Explosion UK",
  description:
    "Log in to your Salsa Explosion account to book Cuban Salsa classes, view your digital QR pass, and review lesson video recaps.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <SignIn />
    </div>
  );
}

