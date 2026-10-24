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
  console.log("🌱 Seeding Salsa Explosion database...");

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

  // Promote only explicitly allow-listed real accounts (ADMIN_EMAILS in .env)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length > 0) {
    await prisma.user.updateMany({
      where: { email: { in: adminEmails } },
      data: { role: Role.ADMIN },
    });
  }

  // 2. Create Admin / Studio Owner (Enrique Perez Valdes)
  const enriqueAdmin = await prisma.user.create({
    data: {
      clerkId: "user_seed_admin_001",
      email: "enrique@salsaexplosion.co.uk",
      firstName: "Enrique",
      lastName: "Perez Valdes",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bio: "Founder & Artistic Director of Salsa Explosion. Born in Cuba, Enrique has been promoting authentic Cuban Salsa, Rueda de Casino, and Afro-Cuban culture across the UK for over 25 years. Awarded the Salsa UK Lifetime Achievement Award and voted UK's Most Popular Salsa Promoter.",
      specialty: "Cuban Salsa, Rueda de Casino, Timba & Afro-Cuban",
      yearsDancing: 28,
      role: Role.ADMIN,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.LEAD,
      classCredits: 999,
    },
  });

  // 3. Create Instructors (Moe Flex, Justyna, Arturas, Jim)
  const instructor1 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_001",
      email: "moe@salsaexplosion.co.uk",
      firstName: "Moe",
      lastName: "Flex",
      avatarUrl: "/images/thursdays-moe-flex-poster.png",
      bio: "London-based, world-renowned salsa instructor, choreographer, DJ, and Master of Ceremonies (MC). Active on the international Latin dance scene since 1998, he is widely celebrated as the 'General of MCs' and is famous for his infectious positive energy, humour, and 'Flex-fun' teaching style.",
      specialty: "Flex-Fun Cuban Salsa, Musicality & Pasitos",
      yearsDancing: 26,
      role: Role.INSTRUCTOR,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.LEAD,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_002",
      email: "justyna@salsaexplosion.co.uk",
      firstName: "Justyna",
      lastName: "Salsa",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio: "Resident Salsa Explosion instructor. Justyna specializes in Cuban follower body movement, frame elasticity, and sensual styling at BOH Studios.",
      specialty: "Casino Follow Styling & Body Movement",
      yearsDancing: 12,
      role: Role.INSTRUCTOR,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.FOLLOW,
    },
  });

  const instructor3 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_003",
      email: "arturas@salsaexplosion.co.uk",
      firstName: "Arturas",
      lastName: "Casino",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Resident Salsa Explosion instructor specializing in crisp Cuban Casino turn patterns, dynamic Rueda de Casino calls, and clear leading fundamentals.",
      specialty: "Cuban Casino Partnerwork & Rueda de Casino",
      yearsDancing: 14,
      role: Role.INSTRUCTOR,
      currentLevel: DanceLevel.ADVANCED,
      preferredRole: DanceRole.LEAD,
    },
  });

  const instructor4 = await prisma.user.create({
    data: {
      clerkId: "user_seed_instructor_004",
      email: "jim@salsaexplosion.co.uk",
      firstName: "Jim",
      lastName: "Salsa",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bio: "Resident Salsa Explosion instructor teaching Tuesdays at Neptune Hall Boscombe and Thursdays at BOH Studios with Maestro Enrique.",
      specialty: "Beginner Foundations & Cuban Clave Timing",
      yearsDancing: 10,
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

  // Helper for recurring weekly class dates
  function getNextWeekdayDate(targetDay: 0 | 1 | 2 | 3 | 4 | 5 | 6, hour: number, minute: number): Date {
    const date = new Date();
    const currentDay = date.getDay();
    let daysUntil = (targetDay - currentDay + 7) % 7;
    if (daysUntil === 0) {
      const currentHour = date.getHours();
      const currentMinute = date.getMinutes();
      if (currentHour > hour || (currentHour === hour && currentMinute >= minute)) {
        daysUntil = 7;
      }
    }
    date.setDate(date.getDate() + daysUntil);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // 5. Create Dance Class Sessions
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(19, 0, 0, 0);

  const twoDaysAgoEnd = new Date(twoDaysAgo);
  twoDaysAgoEnd.setHours(20, 15, 0, 0);

  const class0_past = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Casino: Circular Flow & Dile Que No Mastery",
      description:
        "Comprehensive breakdown of authentic circular Guapea tension, the Dile Que No transition, and Enchufla Doble con Mambo.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: twoDaysAgo,
      endTime: twoDaysAgoEnd,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 6,
      creditCost: 1,
      instructorId: instructor1.id,
      recapVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      recapNotes:
        "¡Excelente clase equipo! Focus on keeping your left arm relaxed during the Enchufla turn. Leads: prep the turn on count 1 with a slight push-pull, do not rush count 3. Follows: keep your steps small and circular. Practiced: Guapea, Dile Que No, Enchufla Doble, Dame Dos, and Vacilala.",
      recapFigures: [
        "Guapea Basic Timing",
        "Dile Que No (Circular Transition)",
        "Enchufla Doble con Mambo",
        "Dame Dos (Rueda Call)",
        "Vacilala y Paseala",
      ],
      recapRecordedAt: twoDaysAgoEnd,
      recapPublished: true,
    },
  });

  // THURSDAYS @ BOH Studios, Bournemouth
  const thu1Start = getNextWeekdayDate(4, 19, 0);
  const thu1End = new Date(thu1Start);
  thu1End.setHours(20, 0, 0, 0);

  const thuClass1 = await prisma.classSession.create({
    data: {
      title: "Solo Salsa: Pasitos, Technique & Musicality (with Moe Flex)",
      description:
        "World-renowned salsa instructor & MC Moe Flex brings his infectious energy, body isolations, and footwork styling! Improvers onwards.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.IMPROVER,
      startTime: thu1Start,
      endTime: thu1End,
      room: "BOH Studios (Ballroom), Bournemouth",
      maxCapacity: 28,
      maxLeads: 14,
      maxFollows: 14,
      bookedCount: 5,
      creditCost: 1,
      instructorId: instructor1.id,
    },
  });

  const thu2Start = getNextWeekdayDate(4, 19, 0);
  const thu2End = new Date(thu2Start);
  thu2End.setHours(20, 0, 0, 0);

  const thuClass2 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Absolute Beginners: Two Separate Rooms (Level 0 & 1)",
      description:
        "Two dedicated beginner rooms running simultaneously with Justyna & Arturas. First-timers welcome, no partner required!",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: thu2Start,
      endTime: thu2End,
      room: "BOH Studios (Ground Floor Studio), Bournemouth",
      maxCapacity: 30,
      maxLeads: 15,
      maxFollows: 15,
      bookedCount: 4,
      creditCost: 1,
      instructorId: instructor3.id,
    },
  });

  const thu3Start = getNextWeekdayDate(4, 19, 0);
  const thu3End = new Date(thu3Start);
  thu3End.setHours(20, 0, 0, 0);

  const thuClass3 = await prisma.classSession.create({
    data: {
      title: "Rueda de Casino Intermediates",
      description:
        "High-octane circular group dancing! Rapid-fire Cuban calls, dame variations, and synchronized partner swaps with Jim & Enrique.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.INTERMEDIATE,
      startTime: thu3Start,
      endTime: thu3End,
      room: "BOH Studios (The Triangle Room), Bournemouth",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 4,
      creditCost: 1,
      instructorId: instructor4.id,
    },
  });

  const thu4Start = getNextWeekdayDate(4, 20, 0);
  const thu4End = new Date(thu4Start);
  thu4End.setHours(21, 15, 0, 0);

  const thuClass4 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Partnerwork All Levels + Free Social till 11:30 PM",
      description:
        "Flagship Thursday session! Dedicated Improvers, Intermediates, and Advanced rooms with Moe Flex, Enrique & team, followed by FREE social dancing until 11:30 PM.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.IMPROVER,
      startTime: thu4Start,
      endTime: thu4End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 40,
      maxLeads: 20,
      maxFollows: 20,
      bookedCount: 7,
      creditCost: 1,
      instructorId: instructor1.id,
    },
  });

  const thu5Start = getNextWeekdayDate(4, 21, 30);
  const thu5End = new Date(thu5Start);
  thu5End.setHours(23, 30, 0, 0);

  const thuClass5 = await prisma.classSession.create({
    data: {
      title: "Thursday Havana Social Fiesta",
      description:
        "Authentic Cuban social dancing, animations, and Timba music with DJ Enrique & Resident Team until late on BOH sprung maple floor.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: thu5Start,
      endTime: thu5End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 50,
      maxLeads: 25,
      maxFollows: 25,
      bookedCount: 4,
      creditCost: 1,
      instructorId: enriqueAdmin.id,
    },
  });

  // SUNDAYS @ BOH Studios, Bournemouth
  const sun1Start = getNextWeekdayDate(0, 18, 30);
  const sun1End = new Date(sun1Start);
  sun1End.setHours(19, 30, 0, 0);

  const sunClass1 = await prisma.classSession.create({
    data: {
      title: "Sunday Cuban Salsa & Rueda Masterclass",
      description:
        "Relaxed Sunday evening session covering essential rhythm, partner frame, and Casino masterclasses with Maestro Enrique & team.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: sun1Start,
      endTime: sun1End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 28,
      maxLeads: 14,
      maxFollows: 14,
      bookedCount: 5,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  const sun2Start = getNextWeekdayDate(0, 19, 30);
  const sun2End = new Date(sun2Start);
  sun2End.setHours(23, 0, 0, 0);

  const sunClass2 = await prisma.classSession.create({
    data: {
      title: "Sunday Havana Social Fiesta & Rueda Circles",
      description:
        "Sunday Havana fiesta social practice with Maestro Enrique, playing authentic Cuban Timba, Son Cubano, and dynamic Rueda circles.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: sun2Start,
      endTime: sun2End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 40,
      maxLeads: 20,
      maxFollows: 20,
      bookedCount: 6,
      creditCost: 1,
      instructorId: enriqueAdmin.id,
    },
  });

  // Seed Class Bookings for Roster & Check-in testing
  await prisma.booking.createMany({
    data: [
      // Attended past class with recap video
      {
        userId: student1.id,
        classSessionId: class0_past.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.ATTENDED,
        checkedInAt: twoDaysAgo,
      },
      {
        userId: student2.id,
        classSessionId: class0_past.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.ATTENDED,
        checkedInAt: twoDaysAgo,
      },
      {
        userId: student4.id,
        classSessionId: class0_past.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.ATTENDED,
        checkedInAt: twoDaysAgo,
      },
      // Thursday BOH Studios class bookings
      {
        userId: student1.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.ATTENDED,
        checkedInAt: new Date(),
      },
      {
        userId: student4.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student6.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: thuClass2.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: thuClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      // Sunday BOH Studios class bookings
      {
        userId: student1.id,
        classSessionId: sunClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: sunClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student4.id,
        classSessionId: sunClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: sunClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: sunClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student6.id,
        classSessionId: thuClass5.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      // Thursday class bookings
      {
        userId: student1.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: thuClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student6.id,
        classSessionId: thuClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student4.id,
        classSessionId: thuClass3.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: thuClass4.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: thuClass4.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student4.id,
        classSessionId: thuClass4.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      // Sunday class bookings
      {
        userId: student6.id,
        classSessionId: sunClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student1.id,
        classSessionId: sunClass2.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: sunClass2.id,
        danceRole: DanceRole.LEAD,
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

  // 7. Create Premiere Events Lineup — Official DANZA! 2026 | 2027 Calendar (BOH Studios Bournemouth)
  // Event 1: Halloween Fancy Dress Latin Party (Saturday 31st October 2026)
  const halloweenEvent = await prisma.event.create({
    data: {
      slug: "halloween-fancy-dress-latin-party-2026",
      title: "★ HALLOWEEN FANCY DRESS PARTY ★ — South Coast Cuban & Latin Night",
      description:
        "The South Coast’s premier Cuban Dance event, Halloween Fancy Dress Edition! Alex Spindlove is bringing The Bachata flavour to our Halloween party. A night dedicated to Cuban, Latin, Kizomba music & dance featuring top South Coast teachers Anna, Xaris, Alex (BOH Studios) PLUS The Salsa Explosion team (Enrique, Moe Flex, Justyna, Arturas & Jim) with DJ Enrique SB&K Night. Best costume prizes: 1st Prize - 1 Made in Cuba Weekend, 2nd Prize - 2 Free Dance Classes, 3rd Prize - 1 Free Entry to Our Party!",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-10-31T20:00:00Z"),
      endDate: new Date("2026-11-01T02:00:00Z"),
      guestArtists: ["Alex Spindlove", "Anna", "Xaris", "Alex (BOH)", "Enrique Perez Valdes", "Moe Flex", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Evening Party & All Classes Pass (8PM - 2AM)",
            description:
              "8:15 PM Bachata Improvers onwards + 9:15 PM Rueda & Salsa classes + 10:00 PM SB&K Social Party until 2:00 AM + Costume competition entry.",
            priceInCents: 1500,
            totalCapacity: 120,
            maxLeads: 60,
            maxFollows: 60,
            salesEndAt: new Date("2026-10-31T19:30:00Z"),
          },
          {
            name: "SB&K Social Dance Party Only (10PM - 2AM)",
            description:
              "Admission from 10:00 PM for Salsa, Bachata & Kizomba social dancing with DJ Enrique & costume prizes.",
            priceInCents: 1000,
            totalCapacity: 150,
            salesEndAt: new Date("2026-10-31T23:00:00Z"),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 2: SB&K Night Extravaganza (Saturday 14th November 2026)
  await prisma.event.create({
    data: {
      slug: "sbk-night-extravaganza-nov-2026",
      title: "SB&K NIGHT! EXTRAVAGANZA — Salsa, Bachata, Timba & Kizomba",
      description:
        "Salsa Explosion presents SB&K Night at BOH Studios Bournemouth! 2 workshop rooms from 8:00 PM followed by our high-energy 4-genre Latin social fiesta until 1:00 AM with DJ Enrique & guest maestros.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-11-14T20:00:00Z"),
      endDate: new Date("2026-11-15T01:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Justyna", "Arturas", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Workshops + Party Pass (8PM - 1AM)",
            description: "Admission to 8PM Bachata & Cuban Salsa classes plus full social party.",
            priceInCents: 1200,
            totalCapacity: 100,
            maxLeads: 50,
            maxFollows: 50,
            salesEndAt: new Date("2026-11-14T19:30:00Z"),
          },
          {
            name: "Fiesta Social Pass Only (From 9:30 PM)",
            description: "Late entry for Salsa, Bachata & Kizomba dancing until 1:00 AM.",
            priceInCents: 800,
            totalCapacity: 120,
            salesEndAt: new Date("2026-11-14T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 3: MADE IN CUBA Dance Weekend 2026 (4–6 December 2026) — Flagship Weekend Festival
  const madeInCubaWeekendEvent = await prisma.event.create({
    data: {
      slug: "made-in-cuba-dance-weekend-2026",
      title: "MADE IN CUBA — Dance Weekend 2026",
      description:
        "Celebrating 33 Years of Salsa Explosion! 3 nights of parties, 2 days of workshops, 2 spectacular shows, and social dancing until 2:00 AM across two dedicated rooms (Salsa Room & Bachata Room). Friday at The Woodlands Ballroom; Saturday and Sunday at BOH Studios Bournemouth.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-12-04T18:00:00Z"),
      endDate: new Date("2026-12-06T23:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Moe Flex", "Yaniel Castillo", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Full 3-Day Congress Pass (Early Bird)",
            description:
              "All workshops (Friday, Saturday & Sunday) + All Night Parties + Masterclass Certificate",
            priceInCents: 9500,
            totalCapacity: 80,
            maxLeads: 40,
            maxFollows: 40,
            salesEndAt: new Date("2026-12-04T17:00:00Z"),
          },
          {
            name: "Saturday Masterclass Bootcamp",
            description:
              "Saturday 5-hour Cuban Masterclass intensive (Casino turns, Afro-Cuban isolation & dynamic partnerwork)",
            priceInCents: 6000,
            totalCapacity: 50,
            maxLeads: 25,
            maxFollows: 25,
            salesEndAt: new Date("2026-12-04T17:00:00Z"),
          },
          {
            name: "Saturday Night Havana Fiesta Pass",
            description:
              "Entry to the Saturday Night Gala Fiesta with live Timba DJ sets, Cuban dance shows & social dancing",
            priceInCents: 2000,
            totalCapacity: 150,
            salesEndAt: new Date("2026-12-05T21:00:00Z"),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 4: Salsa Explosion Xmas Party (Saturday 19th December 2026)
  await prisma.event.create({
    data: {
      slug: "salsa-explosion-xmas-party-2026",
      title: "SALSA EXPLOSION XMAS PARTY! 🎄",
      description:
        "Annual Christmas Cuban & Latin celebration at BOH Studios Bournemouth! Festive animations, special student showcases, holiday rum punch, and non-stop Cuban Salsa and Bachata dancing with Enrique & Moe Flex.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-12-19T20:00:00Z"),
      endDate: new Date("2026-12-20T01:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Moe Flex", "Justyna", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Xmas Party & Workshop Pass",
            description: "8PM festive Cuban Salsa class + Christmas party until 1:00 AM.",
            priceInCents: 1500,
            totalCapacity: 120,
            maxLeads: 60,
            maxFollows: 60,
            salesEndAt: new Date("2026-12-19T19:30:00Z"),
          },
          {
            name: "Xmas Social Party Pass",
            description: "Admission to Christmas Latin party from 9:30 PM.",
            priceInCents: 1000,
            totalCapacity: 150,
            salesEndAt: new Date("2026-12-19T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 5: Xmas Season Latin Party (Sunday 27th December 2026)
  await prisma.event.create({
    data: {
      slug: "xmas-season-latin-party-2026",
      title: "XMAS SEASON LATIN PARTY",
      description:
        "Festive Sunday Latin social gathering at BOH Studios Bournemouth! Burn off the Christmas treats with relaxed Cuban Salsa, Son, and Bachata social dancing with resident maestros.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-12-27T18:00:00Z"),
      endDate: new Date("2026-12-27T23:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Jim", "Arturas", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Workshop & Festive Social",
            description: "6PM Cuban styling workshop + Sunday festive social dancing.",
            priceInCents: 1000,
            totalCapacity: 80,
            maxLeads: 40,
            maxFollows: 40,
            salesEndAt: new Date("2026-12-27T17:30:00Z"),
          },
          {
            name: "Social Dance Only Entry",
            description: "Social entry from 7:30 PM to 11:00 PM.",
            priceInCents: 600,
            totalCapacity: 100,
            salesEndAt: new Date("2026-12-27T20:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 6: NYE Latin Fiesta (Thursday 31st December 2026)
  await prisma.event.create({
    data: {
      slug: "nye-latin-fiesta-the-big-one-2026",
      title: "NYE LATIN FIESTA (THE BIG ONE) — Welcome 2027!",
      description:
        "The premier New Year's Eve Latin countdown fiesta on the South Coast! Midnight champagne toast, 12 grapes Cuban tradition, two dance rooms, and authentic Salsa, Timba & Bachata partying until 3:00 AM.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-12-31T20:00:00Z"),
      endDate: new Date("2027-01-01T03:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Moe Flex", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "NYE All-Inclusive Party Pass",
            description: "Full entry 8PM-3AM, midnight bubbles toast, and Cuban celebration grapes.",
            priceInCents: 2500,
            totalCapacity: 150,
            maxLeads: 75,
            maxFollows: 75,
            salesEndAt: new Date("2026-12-31T19:30:00Z"),
          },
          {
            name: "Midnight Social Entry (From 11PM)",
            description: "Countdown party admission from 11:00 PM to 3:00 AM.",
            priceInCents: 1800,
            totalCapacity: 100,
            salesEndAt: new Date("2026-12-31T23:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 7: First Party of the Year 2027 (Saturday 9th January 2027)
  await prisma.event.create({
    data: {
      slug: "first-party-of-the-year-jan-2027",
      title: "FIRST PARTY OF THE YEAR 2027",
      description:
        "Start 2027 on the dance floor! First major Saturday Latin fiesta of the new year at BOH Studios Bournemouth with high-energy Cuban Salsa workshops and open social dancing.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-01-09T20:00:00Z"),
      endDate: new Date("2027-01-10T01:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Justyna", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Workshops & Party Pass",
            description: "8PM Cuban Salsa classes + fiesta until 1:00 AM.",
            priceInCents: 1200,
            totalCapacity: 100,
            maxLeads: 50,
            maxFollows: 50,
            salesEndAt: new Date("2027-01-09T19:30:00Z"),
          },
          {
            name: "Party Pass Only",
            description: "Social entry from 9:30 PM.",
            priceInCents: 800,
            totalCapacity: 120,
            salesEndAt: new Date("2027-01-09T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 8: Moe Flex Bootcamp & Party (Saturday 30th January 2027)
  const moeFlexBootcampEvent = await prisma.event.create({
    data: {
      slug: "moe-flex-bootcamp-and-party-jan-2027",
      title: "MOE FLEX BOOTCAMP & PARTY — Pure Energy & Musicality",
      description:
        "The General of MCs Moe Flex is back at BOH Studios Bournemouth! 4 hours of intensive daytime Pasitos, body isolations, and musicality bootcamp, followed by an explosive evening Latin party with Moe & Enrique.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-01-30T14:00:00Z"),
      endDate: new Date("2027-01-31T01:00:00Z"),
      guestArtists: ["Moe Flex", "Enrique Perez Valdes", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Full Bootcamp + Evening Party Pass",
            description: "14:00-18:00 masterclass intensive + entry to 8PM-1AM evening party.",
            priceInCents: 4500,
            totalCapacity: 60,
            maxLeads: 30,
            maxFollows: 30,
            salesEndAt: new Date("2027-01-30T13:30:00Z"),
          },
          {
            name: "Evening Party Only (From 8PM)",
            description: "Admission to evening workshops and social dance party.",
            priceInCents: 1200,
            totalCapacity: 120,
            salesEndAt: new Date("2027-01-30T22:30:00Z"),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 9: Valentine Love Dance Weekend (13–14 February 2027)
  await prisma.event.create({
    data: {
      slug: "valentine-love-dance-weekend-2027",
      title: "VALENTINE LOVE DANCE WEEKEND 2027",
      description:
        "Romantic 2-day Cuban Salsa, Son Cubano & Sensual Bachata dance weekender at BOH Studios Bournemouth! Daytime connection masterclasses and Saturday night Red & White Valentine Ball.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-02-13T12:00:00Z"),
      endDate: new Date("2027-02-14T23:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Justyna", "Arturas", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Full Weekend Pass (Both Days + Ball)",
            description: "All workshops across both days plus Saturday night Valentine Ball.",
            priceInCents: 5500,
            totalCapacity: 80,
            maxLeads: 40,
            maxFollows: 40,
            salesEndAt: new Date("2027-02-13T11:30:00Z"),
          },
          {
            name: "Saturday Ball & Social Only",
            description: "Entry to Saturday Night Red & White Valentine Fiesta.",
            priceInCents: 1500,
            totalCapacity: 120,
            salesEndAt: new Date("2027-02-13T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 10: Spring Latin White Party (Saturday 6th March 2027)
  await prisma.event.create({
    data: {
      slug: "spring-latin-white-party-mar-2027",
      title: "SPRING LATIN WHITE PARTY",
      description:
        "Welcome spring dressed in pure white! Salsa Explosion's signature White Fiesta at BOH Studios Bournemouth with guest artists, fun animations, and vibrant Cuban music.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-03-06T20:00:00Z"),
      endDate: new Date("2027-03-07T01:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Anna", "Jim", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "White Party & Workshop Pass",
            description: "8PM Cuban Salsa classes + white dress code fiesta until 1:00 AM.",
            priceInCents: 1400,
            totalCapacity: 100,
            maxLeads: 50,
            maxFollows: 50,
            salesEndAt: new Date("2027-03-06T19:30:00Z"),
          },
          {
            name: "Social Dance Entry Only",
            description: "Social entry from 9:30 PM.",
            priceInCents: 900,
            totalCapacity: 120,
            salesEndAt: new Date("2027-03-06T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Event 11: The Unmatched Dance Star: Barbara Jiménez Weekend (3–4 April 2027)
  const barbaraJimenezEvent = await prisma.event.create({
    data: {
      slug: "barbara-jimenez-cuban-weekend-2027",
      title: "THE UNMATCHED DANCE STAR: BARBARA JIMÉNEZ WEEKEND",
      description:
        "World-renowned Cuban dance superstar Barbara Jiménez comes to BOH Studios Bournemouth! 2 days of world-class Afro-Cuban movement, Cuban styling, Casino partnerwork masterclasses, and Saturday night Gala Fiesta.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-04-03T12:00:00Z"),
      endDate: new Date("2027-04-04T23:00:00Z"),
      guestArtists: ["Barbara Jiménez", "Enrique Perez Valdes", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Full 2-Day Barbara Jiménez Pass",
            description: "All masterclasses across Saturday & Sunday + Saturday Night Gala Fiesta.",
            priceInCents: 7500,
            totalCapacity: 60,
            maxLeads: 30,
            maxFollows: 30,
            salesEndAt: new Date("2027-04-03T11:30:00Z"),
          },
          {
            name: "Saturday Masterclasses + Gala Party",
            description: "Saturday Afro-Cuban & styling intensives + Gala Party entry.",
            priceInCents: 5000,
            totalCapacity: 50,
            maxLeads: 25,
            maxFollows: 25,
            salesEndAt: new Date("2027-04-03T11:30:00Z"),
          },
          {
            name: "Saturday Gala Party Only",
            description: "Saturday Night Gala Fiesta entry with Barbara Jiménez showcase.",
            priceInCents: 1800,
            totalCapacity: 150,
            salesEndAt: new Date("2027-04-03T21:30:00Z"),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 12: Love Cuban Dance Fiesta (Saturday 1st May 2027)
  await prisma.event.create({
    data: {
      slug: "love-cuban-dance-may-2027",
      title: "LOVE CUBAN DANCE FIESTA — May Bank Holiday Edition",
      description:
        "Celebrate the May Bank Holiday weekend with Salsa Explosion! An evening dedicated to Cuban dance, music & culture with Rueda de Casino, Son, and Timba at BOH Studios Bournemouth.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2027-05-01T20:00:00Z"),
      endDate: new Date("2027-05-02T02:00:00Z"),
      guestArtists: ["Enrique Perez Valdes", "Moe Flex", "Arturas", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Bank Holiday Workshop & Fiesta Pass",
            description: "8PM workshops in 2 rooms + party until 2:00 AM.",
            priceInCents: 1400,
            totalCapacity: 100,
            maxLeads: 50,
            maxFollows: 50,
            salesEndAt: new Date("2027-05-01T19:30:00Z"),
          },
          {
            name: "Evening Social Entry Only",
            description: "Social dancing admission from 9:30 PM.",
            priceInCents: 900,
            totalCapacity: 120,
            salesEndAt: new Date("2027-05-01T22:30:00Z"),
          },
        ],
      },
    },
  });

  // Seed sample Event Registrations for Made in Cuba Weekend
  const fullPassTier = madeInCubaWeekendEvent.ticketTiers[0];
  if (fullPassTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student1.id,
          eventId: madeInCubaWeekendEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "SE-PASS-SOFIA-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: false,
        },
        {
          userId: student4.id,
          eventId: madeInCubaWeekendEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-PASS-MATEO-002",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: true,
          checkedInAt: new Date(),
        },
        {
          userId: student5.id,
          eventId: madeInCubaWeekendEvent.id,
          ticketTierId: fullPassTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "SE-PASS-LUCIA-003",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: false,
        },
      ],
    });
  }

  // Seed sample registrations for Halloween Latin Party
  const halloweenTier = halloweenEvent.ticketTiers[0];
  if (halloweenTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student1.id,
          eventId: halloweenEvent.id,
          ticketTierId: halloweenTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "SE-HALLOWEEN-SOFIA-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 1500,
          checkedIn: false,
        },
        {
          userId: student4.id,
          eventId: halloweenEvent.id,
          ticketTierId: halloweenTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-HALLOWEEN-MATEO-002",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 1500,
          checkedIn: false,
        },
      ],
    });
  }

  // Seed sample registrations for Moe Flex Bootcamp
  const moeFlexTier = moeFlexBootcampEvent.ticketTiers[0];
  if (moeFlexTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student2.id,
          eventId: moeFlexBootcampEvent.id,
          ticketTierId: moeFlexTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-MOE-DAVID-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 4500,
          checkedIn: false,
        },
        {
          userId: student3.id,
          eventId: moeFlexBootcampEvent.id,
          ticketTierId: moeFlexTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "SE-MOE-CAMILA-002",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 4500,
          checkedIn: true,
          checkedInAt: new Date(),
        },
      ],
    });
  }

  // Seed sample registrations for Barbara Jiménez Masterclass
  const barbaraTier = barbaraJimenezEvent.ticketTiers[0];
  if (barbaraTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student6.id,
          eventId: barbaraJimenezEvent.id,
          ticketTierId: barbaraTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-BARBARA-JAMES-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 7500,
          checkedIn: false,
        },
      ],
    });
  }

  console.log("✅ Salsa Explosion database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
