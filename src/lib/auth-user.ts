import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { DanceLevel, DanceRole, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isNextControlFlowError } from "@/lib/safe-url";
import { reportError } from "@/lib/monitoring";

/** Complimentary credits granted to a brand-new student account. */
export const WELCOME_CREDITS = 1;

export function isFallbackUser(user: { id: string }): boolean {
  return user.id.startsWith("fallback-");
}

export const SERVICE_UNAVAILABLE_MESSAGE =
  "We can't reach our booking system right now. Please try again in a minute.";

/** Safe post-auth and post-sign-out destination routes */
export const CLERK_AFTER_SIGN_OUT_URL = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || "/";
export const CLERK_SIGN_IN_FALLBACK_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/";
export const CLERK_SIGN_UP_FALLBACK_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/";

/**
 * Comma-separated list of emails that are bootstrapped as ADMIN on first sign-in
 * (e.g. ADMIN_EMAILS="you@example.com,owner@studio.com").
 * Every other new account is a STUDENT. Never grant elevated roles by default.
 * STRICTLY FAIL-CLOSED: If ADMIN_EMAILS is empty or missing, returns false in ALL environments.
 */
export function isBootstrapAdmin(email?: string | null): boolean {
  if (!email) return false;
  const raw = (process.env.ADMIN_EMAILS ?? "").trim();
  if (!raw) {
    return false; // Fail-closed in all environments
  }
  const adminSet = new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
  return adminSet.has(email.trim().toLowerCase());
}

/**
 * Guard for interactive demo role switcher:
 * Returns true ONLY when:
 * 1. ALLOW_DEMO_ROLE_SWITCHING === "true"
 * 2. email is present in DEMO_SWITCHER_EMAILS (strictly fail-closed if empty or not matching)
 */
export function canSwitchRoles(email?: string | null): boolean {
  if (!email) return false;
  if (process.env.ALLOW_DEMO_ROLE_SWITCHING !== "true") return false;

  const raw = (process.env.DEMO_SWITCHER_EMAILS ?? "").trim();
  if (!raw) return false;

  const allowedSet = new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowedSet.has(email.trim().toLowerCase());
}

export async function getOrProvisionCurrentUser() {
  let clerkId: string | null = null;
  try {
    const authState = await auth();
    clerkId = authState.userId;
  } catch (authErr: unknown) {
    if (isNextControlFlowError(authErr)) {
      throw authErr;
    }
    reportError("getOrProvisionCurrentUser:auth", authErr);
    return null;
  }

  if (!clerkId) {
    return null;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });
    if (existing) {
      if (
        existing.role !== Role.ADMIN &&
        isBootstrapAdmin(existing.email) &&
        !canSwitchRoles(existing.email)
      ) {
        return await prisma.user.update({
          where: { id: existing.id },
          data: { role: Role.ADMIN },
          include: { subscription: true },
        });
      }
      return existing;
    }

    let clerkUser: Awaited<ReturnType<typeof currentUser>> = null;
    try {
      clerkUser = await currentUser();
    } catch (userErr: unknown) {
      if (isNextControlFlowError(userErr)) {
        throw userErr;
      }
      console.warn("[getOrProvisionCurrentUser:currentUser]", userErr);
    }

    const primaryEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      `${clerkId}@salsaexplosion.local`;

    const isAdmin = isBootstrapAdmin(primaryEmail);

    // upsert (not create) so two parallel first requests can't both insert
    return await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        email: primaryEmail,
        firstName: clerkUser?.firstName || "Dancer",
        lastName: clerkUser?.lastName || "",
        avatarUrl: clerkUser?.imageUrl || null,
        role: isAdmin ? Role.ADMIN : Role.STUDENT,
        currentLevel: DanceLevel.BEGINNER,
        preferredRole: DanceRole.LEAD,
        classCredits: WELCOME_CREDITS,
      },
      include: { subscription: true },
    });
  } catch (dbErr: unknown) {
    if (isNextControlFlowError(dbErr)) {
      throw dbErr;
    }
    reportError("getOrProvisionCurrentUser:db", dbErr);
    // Graceful in-memory fallback prevents 500 error when database connection pooler is degraded
    return {
      id: `fallback-${clerkId}`,
      clerkId,
      email: `${clerkId}@salsaexplosion.local`,
      firstName: "Dancer",
      lastName: "",
      avatarUrl: null,
      bio: null,
      specialty: null,
      yearsDancing: 8,
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
      preferredRole: DanceRole.LEAD,
      classCredits: WELCOME_CREDITS,
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: null,
    };
  }
}

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof getOrProvisionCurrentUser>>
>;

/**
 * Server Component guard. Redirects anonymous users to sign-in and
 * users without one of the allowed roles back to the student schedule.
 */
export async function requireRole(allowed: Role[]): Promise<CurrentUser> {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (!allowed.includes(user.role)) {
    redirect("/dashboard/schedule");
  }
  return user;
}

export const STAFF_ROLES: Role[] = [Role.INSTRUCTOR, Role.ADMIN];
export const ADMIN_ONLY: Role[] = [Role.ADMIN];
