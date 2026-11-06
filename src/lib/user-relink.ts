import { prisma } from "@/lib/prisma";

/**
 * Moving from Clerk's development keys to its live keys gives every person a new Clerk id. Without
 * this, a returning dancer's first sign-in collides with their own email and they get locked out,
 * and their passes stay on the old row. The email must be one Clerk has verified: that's what proves
 * the new login belongs to the same person.
 */
export async function relinkUserByVerifiedEmail(clerkId: string, verifiedEmail: string) {
  const existing = await prisma.user.findUnique({ where: { email: verifiedEmail } });
  if (!existing || existing.clerkId === clerkId) return null;
  console.info(`[user-relink] Linked user ${existing.id} to a new Clerk id`);
  return prisma.user.update({
    where: { id: existing.id },
    data: { clerkId },
    include: { subscription: true },
  });
}
