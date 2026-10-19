import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/how-it-works(.*)",
  "/about(.*)",
  "/events(.*)",
  "/pricing(.*)",
  "/venues(.*)",
  "/private-lessons(.*)",
  "/music(.*)",
  "/shop(.*)",
  "/dashboard/schedule(.*)",
  "/dashboard/rueda(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
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
