import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/schedule(.*)",
  "/dashboard",
  "/classes(.*)",
  "/rueda(.*)",
  // Old addresses of the two pages above: they only redirect, so never send them to sign-in
  "/dashboard/schedule(.*)",
  "/dashboard/rueda(.*)",
  "/dashboard/wallet(.*)",
  "/dashboard/referrals(.*)",
  "/how-it-works(.*)",
  "/about(.*)",
  "/events(.*)",
  "/pricing(.*)",
  "/venues(.*)",
  "/private-lessons(.*)",
  "/vouchers(.*)",
  "/music(.*)",
  // Dancer move library (approved moves only)
  "/moves(.*)",
  // Art-direction mock-ups (noindex comparison pages)
  "/mockups(.*)",
  "/shop(.*)",
  "/terms(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
  // Own auth: CRON_SECRET bearer token / signed unsubscribe link
  "/api/cron/(.*)",
  "/api/email/unsubscribe",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
  // Social share card for the home page (event cards are covered by /events)
  "/opengraph-image(.*)",
  // Class-night posters for Instagram and the printable wall poster (public timetable only)
  "/cartel(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  await auth.protect();

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
