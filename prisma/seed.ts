import {
  PrismaClient,
  Role,
  DanceLevel,
  DanceStyle,
  DanceRole,
  BookingStatus,
  EventStatus,
  SubmissionStatus,
  TransactionType,
  TicketPaymentStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding RitmoFlow database...");

  // 1. Clean existing seeded records while preserving real Clerk users
  await prisma.eventRegistration.deleteMany();
  await prisma.eventTicketTier.deleteMany();
  await prisma.event.deleteMany();
  await prisma.creditLedger.deleteMany({
    where: { user: { clerkId: { startsWith: "user_seed_" } } },
  });
  await prisma.subscription.deleteMany({
    where: { user: { clerkId: { startsWith: "user_seed_" } } },
  });
  await prisma.videoSubmission.deleteMany({
    where: { student: { clerkId: { startsWith: "user_seed_" } } },
  });
  await prisma.booking.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.user.deleteMany({
    where: { clerkId: { startsWith: "user_seed_" } },
  });

  // Ensure any existing real logged-in Clerk users have ADMIN privileges and credits for testing
  await prisma.user.updateMany({
    where: { NOT: { clerkId: { startsWith: "user_seed_" } } },
    data: { role: Role.ADMIN },
  });

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

  // 4. Create Diverse Cuban Salsa Students across all 4 Levels
  const student1 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_001",
      email: "sofia.mendoza@example.com",
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
      email: "david.kim@example.com",
      firstName: "David",
      lastName: "Kim",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
      preferredRole: DanceRole.LEAD,
      classCredits: 2,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_003",
      email: "camila.torres@example.com",
      firstName: "Camila",
      lastName: "Torres",
      role: Role.STUDENT,
      currentLevel: DanceLevel.INTERMEDIATE,
      preferredRole: DanceRole.FOLLOW,
      classCredits: 8,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_004",
      email: "mateo.silva@example.com",
      firstName: "Mateo",
      lastName: "Silva",
      role: Role.STUDENT,
      currentLevel: DanceLevel.IMPROVER,
      preferredRole: DanceRole.LEAD,
      classCredits: 4,
    },
  });

  const student5 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_005",
      email: "lucia.fernandez@example.com",
      firstName: "Lucia",
      lastName: "Fernandez",
      role: Role.STUDENT,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.FOLLOW,
      classCredits: 10,
    },
  });

  const student6 = await prisma.user.create({
    data: {
      clerkId: "user_seed_student_006",
      email: "james.walker@example.com",
      firstName: "James",
      lastName: "Walker",
      role: Role.STUDENT,
      currentLevel: DanceLevel.BEGINNER,
      preferredRole: DanceRole.LEAD,
      classCredits: 1,
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
        description: "5-Class Rhythm Pack Purchase",
      },
      {
        userId: student2.id,
        amount: 2,
        balanceAfter: 2,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "Drop-in 2-Pass Purchase",
      },
      {
        userId: student3.id,
        amount: 10,
        balanceAfter: 10,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "10-Class Casino Mastery Pack",
      },
      {
        userId: student4.id,
        amount: 5,
        balanceAfter: 5,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "5-Class Rhythm Pack Purchase",
      },
      {
        userId: student5.id,
        amount: 10,
        balanceAfter: 10,
        type: TransactionType.CREDIT_PACK_PURCHASE,
        description: "10-Class Casino Mastery Pack",
      },
    ],
  });

  // 5. Create Dance Class Sessions
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 30, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(19, 45, 0, 0);

  const class1 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Casino: Rueda Foundations",
      description:
        "Master fundamental Rueda de Casino calls: Dame, Enchufla, Dile Que No, and Guapea timing with crisp circular group flow.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      room: "Main Havana Studio",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 4,
      creditCost: 1,
      instructorId: instructor1.id,
    },
  });

  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);
  nextDay.setHours(20, 0, 0, 0);

  const nextDayEnd = new Date(nextDay);
  nextDayEnd.setHours(21, 30, 0, 0);

  const class2 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Casino: Setenta & Sombrero Turn Patterns",
      description:
        "Intermediate partnerwork focusing on Setenta (70), Setenta Complicado, Vacilala, and Sombrero with Afro-Cuban Rumba body movement.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.IMPROVER,
      startTime: nextDay,
      endTime: nextDayEnd,
      room: "Studio B (Mirrors)",
      maxCapacity: 20,
      maxLeads: 10,
      maxFollows: 10,
      bookedCount: 3,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  const dayThree = new Date();
  dayThree.setDate(dayThree.getDate() + 3);
  dayThree.setHours(19, 30, 0, 0);

  const dayThreeEnd = new Date(dayThree);
  dayThreeEnd.setHours(21, 0, 0, 0);

  const class3 = await prisma.classSession.create({
    data: {
      title: "Timba Musicality & Advanced Contratiempo Knot Figures",
      description:
        "High-tempo Cuban Timba phrasing, Rumba Guaguanco accents, Setenta con Alarde, and complex multi-turn combinations.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.INTERMEDIATE,
      startTime: dayThree,
      endTime: dayThreeEnd,
      room: "Main Havana Studio",
      maxCapacity: 16,
      maxLeads: 8,
      maxFollows: 8,
      bookedCount: 2,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  // Seed Class Bookings for Roster & Check-in testing
  await prisma.booking.createMany({
    data: [
      {
        userId: student1.id,
        classSessionId: class1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: class1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.ATTENDED,
        checkedInAt: new Date(),
      },
      {
        userId: student4.id,
        classSessionId: class1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student6.id,
        classSessionId: class1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student1.id,
        classSessionId: class2.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: class2.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student4.id,
        classSessionId: class2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: class3.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: class3.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
    ],
  });

  // 6. Create Sample Video Submissions for Instructor Grading Queue
  await prisma.videoSubmission.create({
    data: {
      studentId: student2.id,
      style: DanceStyle.CUBAN_SALSA,
      currentLevel: DanceLevel.BEGINNER,
      targetLevel: DanceLevel.IMPROVER,
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      studentNotes:
        "Practicing Guapea, Dile Que No, and Enchufla. Looking for feedback on arm tension in count 5.",
      status: SubmissionStatus.PENDING,
    },
  });

  await prisma.videoSubmission.create({
    data: {
      studentId: student1.id,
      style: DanceStyle.CUBAN_SALSA,
      currentLevel: DanceLevel.IMPROVER,
      targetLevel: DanceLevel.INTERMEDIATE,
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      studentNotes:
        "Here is my Setenta and Vacilala combination. Looking to advance to Intermediate level!",
      status: SubmissionStatus.PENDING,
    },
  });

  await prisma.videoSubmission.create({
    data: {
      studentId: student3.id,
      instructorId: instructor1.id,
      style: DanceStyle.CUBAN_SALSA,
      currentLevel: DanceLevel.IMPROVER,
      targetLevel: DanceLevel.INTERMEDIATE,
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      studentNotes: "Sombrero and Kentucky execution on clave timing.",
      status: SubmissionStatus.APPROVED,
      feedback:
        "Excellent grounded Cuban basic and circular travel on Dile Que No. Your Sombrero double-hand transition stayed right on counts 1-2-3. Promoted to Intermediate!",
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Create Premiere Guest Artist Event
  const guestEvent = await prisma.event.create({
    data: {
      slug: "havana-rueda-mastery-intensive",
      title: "Havana Rueda & Afro-Cuban Weekend Intensive",
      description:
        "An exclusive 2-day immersive masterclass featuring world-renowned Cuban maestros. Dive deep into complex Casino knot combinations, authentic Rumba Columbia body isolation, and dynamic Rueda de Casino calling dynamics.",
      venueName: "Gran Teatro Havana Hall",
      venueAddress: "142 Rhythm Way, Central Studio Complex, London",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      guestArtists: ["Maestro Alberto Valdes", "Maestra Yanet Fuentes"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Full Weekend Pass (Early Bird)",
            description:
              "All workshops (Saturday & Sunday) + Saturday Night Gala Social Party + Workshop Certificate",
            priceInCents: 9500,
            totalCapacity: 80,
            maxLeads: 40,
            maxFollows: 40,
            salesEndAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Saturday Bootcamp Only",
            description:
              "Saturday 4-hour Cuban Masterclass intensive (Casino turns & dynamic partnering)",
            priceInCents: 6000,
            totalCapacity: 50,
            maxLeads: 25,
            maxFollows: 25,
            salesEndAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Saturday Night Social Party Pass",
            description:
              "Entry to Saturday Night Gala Social with live Timba DJ & guest artist performances",
            priceInCents: 2000,
            totalCapacity: 150,
            salesEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Seed sample Event Registrations
  const fullPassTier = guestEvent.ticketTiers[0];
  if (fullPassTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student1.id,
          eventId: guestEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "RF-PASS-SOFIA-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: false,
        },
        {
          userId: student4.id,
          eventId: guestEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "RF-PASS-MATEO-002",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: true,
          checkedInAt: new Date(),
        },
        {
          userId: student5.id,
          eventId: guestEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "RF-PASS-LUCIA-003",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: false,
        },
      ],
    });
  }

  console.log("✅ RitmoFlow database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
