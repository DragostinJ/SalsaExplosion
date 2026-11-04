import type { Metadata } from "next";
import { ReviewBoosterClient } from "@/components/review/review-booster-client";

export const metadata: Metadata = {
  title: { absolute: "Review Salsa Explosion on Google" },
  description:
    "Support Maestro Enrique Perez Valdes and Salsa Explosion UK. Leave a quick 30-second Google review for our weekly Cuban Salsa & Rueda de Casino classes at BOH Studios Bournemouth.",
  openGraph: {
    title: "Support Salsa Explosion UK — 30-Second Google Review",
    description:
      "Help dancers find authentic Cuban Salsa & Rueda de Casino in Bournemouth at BOH Studios.",
  },
};

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ReviewBoosterClient />
      </div>
    </div>
  );
}
