import { auth, currentUser } from "@clerk/nextjs/server";
import { DanceLevel, DanceRole, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getOrProvisionCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses[0]?.emailAddress || `${clerkId}@ritmoflow.local`;

    user = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        firstName: clerkUser?.firstName || "Studio",
        lastName: clerkUser?.lastName || "Founder",
        avatarUrl: clerkUser?.imageUrl || null,
        role: Role.ADMIN,
        currentLevel: DanceLevel.IMPROVER,
        preferredRole: DanceRole.LEAD,
        classCredits: 5,
      },
      include: { subscription: true },
    });
  }

  return user;
}
