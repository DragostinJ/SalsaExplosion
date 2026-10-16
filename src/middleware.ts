import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/schedule(.*)",
  "/pricing(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
]);

const isInstructorRoute = createRouteMatcher(["/instructor(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { sessionClaims } = await auth.protect();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  if (isAdminRoute(req) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/schedule", req.url));
  }

  if (isInstructorRoute(req) && role !== "INSTRUCTOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/schedule", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
