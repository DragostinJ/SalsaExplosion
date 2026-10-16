import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { DanceLevel, DanceRole, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Complimentary credits granted to a brand-new student account. */
export const WELCOME_CREDITS = 1;

/**
 * Comma-separated list of emails that are bootstrapped as ADMIN on first sign-in
 * (e.g. ADMIN_EMAILS="you@example.com,owner@studio.com").
 * Every other new account is a STUDENT. Never grant elevated roles by default.
 */
function isBootstrapAdmin(email: string): boolean {
  const raw = (process.env.ADMIN_EMAILS ?? "").trim();
  if (!raw) {
    return process.env.NODE_ENV !== "production";
  }
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export async function getOrProvisionCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });
  if (existing) {
    return existing;
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    `${clerkId}@ritmoflow.local`;

  const isAdmin = isBootstrapAdmin(primaryEmail);

  // upsert (not create) so two parallel first requests can't both insert
  return prisma.user.upsert({
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
