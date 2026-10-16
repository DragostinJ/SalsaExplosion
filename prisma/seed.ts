import {
  PrismaClient,
  Role,
  DanceLevel,
  DanceStyle,
  DanceRole,
  SubmissionStatus,
  TransactionType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding RitmoFlow database...");

  // 1. Clean existing records (in reverse relation order)
  await prisma.creditLedger.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.videoSubmission.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin / Studio Owner
  const admin = await prisma.user.create({
    data: {
      clerkId: "user_seed_admin_001",
      email: "owner@ritmoflow.studio",
      firstName: "Carlos",
      lastName: "Santana",
      role: Role.ADMIN,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.LEAD,
      classCredits: 999,
    },
  });

  // 3. Create Instructors
  const instructor1 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_001",
      email: "elena@ritmoflow.studio",
      firstName: "Elena",
      lastName: "Reyes",
      role: Role.INSTRUCTOR,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.FOLLOW,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_002",
      email: "marcos@ritmoflow.studio",
      firstName: "Marcos",
      lastName: "Valdes",
      role: Role.INSTRUCTOR,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.LEAD,
    },
  });

  // 4. Create Students
  const student1 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_001",
      email: "sofia.student@example.com",
      firstName: "Sofia",
      lastName: "Mendoza",
      role: Role.STUDENT,
      currentLevel: DanceLevel.IMPROVER,
      preferredRole: DanceRole.FOLLOW,
      classCredits: 5,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_002",
      email: "david.lead@example.com",
      firstName: "David",
      lastName: "Kim",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
      preferredRole: DanceRole.LEAD,
      classCredits: 2,
    },
  });

  // Initial Credit Ledger entries for audit trail
  await prisma.creditLedger.createMany({
    data: [
      {
        userId: student1.id,
        amount: 5,
        balanceAfter: 5,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "Initial 5-Class Pass Purchase",
      },
      {
        userId: student2.id,
        amount: 2,
        balanceAfter: 2,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "Initial Drop-in 2-Pass Purchase",
      },
    ],
  });

  // 5. Create Dance Class Sessions
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 30, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(19, 45, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(19, 0, 0, 0);

  const dayAfterEnd = new Date(dayAfter);
  dayAfterEnd.setHours(20, 15, 0, 0);

  const class1 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Casino: Rueda Foundations",
      description: "Master essential Rueda calls, Dile Que No, and Guapea rhythm.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      room: "Studio Havana (Room A)",
      startTime: tomorrow,
      endTime: tomorrowEnd,
      maxCapacity: 20,
      maxLeads: 10,
      maxFollows: 10,
      bookedCount: 1,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  const class2 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Casino: Setenta & Sombrero Turn Patterns",
      description: "Improver turn combinations, fluid hand tosses, and Cuban body motion.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.IMPROVER,
      room: "Studio Santiago (Room B)",
      startTime: dayAfter,
      endTime: dayAfterEnd,
      maxCapacity: 16,
      maxLeads: 8,
      maxFollows: 8,
      bookedCount: 1,
      creditCost: 1,
      instructorId: instructor1.id,
    },
  });

  // 6. Create Initial Confirmed Bookings
  await prisma.booking.create({
    data: {
      userId: student2.id,
      classSessionId: class1.id,
      danceRole: DanceRole.LEAD,
    },
  });

  await prisma.booking.create({
    data: {
      userId: student1.id,
      classSessionId: class2.id,
      danceRole: DanceRole.FOLLOW,
    },
  });

  // 7. Create Pending Video Submissions for the Review Queue
  await prisma.videoSubmission.create({
    data: {
      studentId: student2.id,
      style: DanceStyle.CUBAN_SALSA,
      currentLevel: DanceLevel.BEGINNER,
      targetLevel: DanceLevel.IMPROVER,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      studentNotes: "Practicing Guapea, Dile Que No, and Enchufla. Looking for feedback on arm tension in count 5.",
      status: SubmissionStatus.PENDING,
    },
  });

  await prisma.videoSubmission.create({
    data: {
      studentId: student1.id,
      style: DanceStyle.CUBAN_SALSA,
      currentLevel: DanceLevel.IMPROVER,
      targetLevel: DanceLevel.INTERMEDIATE,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      studentNotes: "Here is my Setenta and Vacilala combination. Looking to advance to Intermediate level!",
      status: SubmissionStatus.PENDING,
    },
  });

  console.log("✅ RitmoFlow database seeded successfully!");
  console.log({
    admin: admin.email,
    instructors: [instructor1.email, instructor2.email],
    students: [student1.email, student2.email],
    classes: [class1.title, class2.title],
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
