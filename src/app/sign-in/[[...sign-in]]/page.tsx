import { Metadata } from "next";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

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
    <main id="main-content" tabIndex={-1} className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-4">
      <Image
        src={MEDIA_MANIFEST.mockupGraphics.claves.src}
        alt=""
        width={MEDIA_MANIFEST.mockupGraphics.claves.width}
        height={MEDIA_MANIFEST.mockupGraphics.claves.height}
        sizes="6rem"
        priority
        className="w-20 sm:w-24"
      />
      <SignIn />
    </main>
  );
}

