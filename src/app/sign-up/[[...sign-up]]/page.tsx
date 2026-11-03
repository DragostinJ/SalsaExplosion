import { Metadata } from "next";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export const metadata: Metadata = {
  title: "Create Free Student Account | Salsa Explosion UK",
  description:
    "Join Salsa Explosion UK to tell the teachers you're coming to Cuban Casino classes at BOH Studios Bournemouth (pay at the door), practise the class songs and track your syllabus progression.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignUpPage() {
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
      <SignUp />
    </main>
  );
}

