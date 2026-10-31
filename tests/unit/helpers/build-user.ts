import { DanceLevel, DanceRole, Role, type User } from "@prisma/client";

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-default-id",
    clerkId: "clerk_default_id",
    email: "dancer@bournemouth.co.uk",
    firstName: "Carlos",
    lastName: "Valdes",
    avatarUrl: null,
    bio: null,
    specialty: null,
    yearsDancing: 5,
    role: Role.STUDENT,
    currentLevel: DanceLevel.BEGINNER,
    preferredRole: DanceRole.LEAD,
    classCredits: 2,
    stripeCustomerId: null,
    classRemindersOptOut: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
