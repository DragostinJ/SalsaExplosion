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

  // TUESDAYS @ Neptune Hall, Boscombe
  const tue1Start = getNextWeekdayDate(2, 19, 15);
  const tue1End = new Date(tue1Start);
  tue1End.setHours(20, 15, 0, 0);

  const tueClass1 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Level 1: Beginner 2 & Foundations",
      description:
        "Step up from the basics with Jim & Enrique! Circular footwork, Dile Que No, and partner connection overlooking the waves at Boscombe Pier.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: tue1Start,
      endTime: tue1End,
      room: "Neptune Hall (Beachfront), Boscombe",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 4,
      creditCost: 1,
      instructorId: instructor4.id,
    },
  });

  const tue2Start = getNextWeekdayDate(2, 20, 30);
  const tue2End = new Date(tue2Start);
  tue2End.setHours(21, 30, 0, 0);

  const tueClass2 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Level 2: Improvers Partnerwork & Rueda",
      description:
        "Dynamic partner turn patterns, Setenta variations, Enchufla flow, and synchronized circle calls on the seafront with Jim & Enrique.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.IMPROVER,
      startTime: tue2Start,
      endTime: tue2End,
      room: "Neptune Hall (Beachfront), Boscombe",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 3,
      creditCost: 1,
      instructorId: enriqueAdmin.id,
    },
  });

  // WEDNESDAYS @ The Woodlands Ballroom, Poole
  const wed1Start = getNextWeekdayDate(3, 19, 0);
  const wed1End = new Date(wed1Start);
  wed1End.setHours(20, 0, 0, 0);

  const wedClass1 = await prisma.classSession.create({
    data: {
      title: "6-Week Absolute Beginners Cuban Salsa Course (Level 0)",
      description:
        "Complete beginner course with Maestro Enrique Perez Valdes from Cuba! Zero experience or partner required. Sprung wooden ballroom floor.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: wed1Start,
      endTime: wed1End,
      room: "The Woodlands Ballroom (Wood Sprung Floor), Poole",
      maxCapacity: 30,
      maxLeads: 15,
      maxFollows: 15,
      bookedCount: 6,
      creditCost: 1,
      instructorId: enriqueAdmin.id,
    },
  });

  const wed2Start = getNextWeekdayDate(3, 19, 0);
  const wed2End = new Date(wed2Start);
  wed2End.setHours(20, 0, 0, 0);

  const wedClass2 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Beginner 2: Technique & Turn Timing (Level 1)",
      description:
        "Sharpen your Guapea, Vacilala, and body movement with Justyna & Arturas in room 2 of The Woodlands Ballroom.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: wed2Start,
      endTime: wed2End,
      room: "The Woodlands Ballroom (Studio 2), Poole",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 2,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  const wed3Start = getNextWeekdayDate(3, 20, 0);
  const wed3End = new Date(wed3Start);
  wed3End.setHours(21, 0, 0, 0);

  const wedClass3 = await prisma.classSession.create({
    data: {
      title: "Cuban Salsa Improvers 2 & Intermediates Partnerwork",
      description:
        "Complex Cuban Casino turns, Sombrero variations, and authentic musicality on Canadian maple and sprung wood with Maestro Enrique.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.INTERMEDIATE,
      startTime: wed3Start,
      endTime: wed3End,
      room: "The Woodlands Ballroom (Main Hall), Poole",
      maxCapacity: 30,
      maxLeads: 15,
      maxFollows: 15,
      bookedCount: 3,
      creditCost: 1,
      instructorId: enriqueAdmin.id,
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
      bookedCount: 2,
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

  // SUNDAYS @ BOH Studios, Bournemouth
  const sun1Start = getNextWeekdayDate(0, 18, 0);
  const sun1End = new Date(sun1Start);
  sun1End.setHours(19, 0, 0, 0);

  const sunClass1 = await prisma.classSession.create({
    data: {
      title: "Sunday Cuban Salsa Beginners",
      description:
        "Relaxed Sunday evening session covering essential rhythm, partner frame, and basic Casino steps with Justyna & Arturas.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.BEGINNER,
      startTime: sun1Start,
      endTime: sun1End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 24,
      maxLeads: 12,
      maxFollows: 12,
      bookedCount: 3,
      creditCost: 1,
      instructorId: instructor2.id,
    },
  });

  const sun2Start = getNextWeekdayDate(0, 19, 0);
  const sun2End = new Date(sun2Start);
  sun2End.setHours(20, 30, 0, 0);

  const sunClass2 = await prisma.classSession.create({
    data: {
      title: "Sunday Salsa Improvers, Rueda Intermediates & 8PM Social Practice",
      description:
        "Intermediate combinations and fast-paced Rueda calls from 7:00 PM, followed by an open social dancing practice session from 8:00 PM with Enrique.",
      style: DanceStyle.CUBAN_SALSA,
      minLevel: DanceLevel.INTERMEDIATE,
      startTime: sun2Start,
      endTime: sun2End,
      room: "BOH Studios (Main Ballroom), Bournemouth",
      maxCapacity: 30,
      maxLeads: 15,
      maxFollows: 15,
      bookedCount: 5,
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
      // Tuesday class bookings
      {
        userId: student1.id,
        classSessionId: tueClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: tueClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.ATTENDED,
        checkedInAt: new Date(),
      },
      {
        userId: student4.id,
        classSessionId: tueClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student6.id,
        classSessionId: tueClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: tueClass2.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: tueClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      // Wednesday class bookings
      {
        userId: student1.id,
        classSessionId: wedClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student3.id,
        classSessionId: wedClass1.id,
        danceRole: DanceRole.FOLLOW,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student4.id,
        classSessionId: wedClass1.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student2.id,
        classSessionId: wedClass2.id,
        danceRole: DanceRole.LEAD,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: student5.id,
        classSessionId: wedClass3.id,
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

  // 7. Create Premiere Events Lineup (Salsa Explosion UK)
  // Flagship Congress
  const guestEvent = await prisma.event.create({
    data: {
      slug: "bournemouth-summer-cuban-salsa-congress-2026",
      title: "Bournemouth Summer Cuban Salsa Congress 2026",
      description:
        "The UK's flagship Cuban dance festival! 3 days of intensive Cuban Salsa, Rueda de Casino, and Afro-Cuban masterclasses with world-class maestros from Cuba, culminating in our legendary Havana Fiesta Gala Party nights overlooking Bournemouth beach.",
      venueName: "The Roundhouse Hotel & BOH Studios",
      venueAddress: "Meyrick Road & 104 Commercial Rd, Bournemouth, BH1 2PR",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      guestArtists: ["Enrique Perez Valdes", "Yaniel Castillo", "Fredy Clan", "DJ Enrique"],
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
            salesEndAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Saturday Masterclass Bootcamp",
            description:
              "Saturday 5-hour Cuban Masterclass intensive (Casino turns, Afro-Cuban isolation & dynamic partnerwork)",
            priceInCents: 6000,
            totalCapacity: 50,
            maxLeads: 25,
            maxFollows: 25,
            salesEndAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Saturday Night Havana Fiesta Pass",
            description:
              "Entry to the Saturday Night Gala Fiesta with live Timba DJ sets, Cuban dance shows & social dancing",
            priceInCents: 2000,
            totalCapacity: 150,
            salesEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 2: Made in Cuba! Thursday Salsa & Rueda Fiesta
  const madeInCubaEvent = await prisma.event.create({
    data: {
      slug: "made-in-cuba-thursday-fiesta",
      title: "Made in Cuba! Thursday Salsa & Rueda Fiesta",
      description:
        "Bournemouth's legendary weekly Thursday Cuban night at BOH Studios! 2 hours of high-energy classes (Beginners, Improvers, and Advanced Rueda de Casino) followed by pure Timba, Cuban Salsa, and Bachata social dancing until midnight with DJ Enrique & special guest instructors.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Rd, Bournemouth, BH2 5LR",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      guestArtists: ["Enrique Perez Valdes", "Moe Flex", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "2-Hour Classes + Party Pass",
            description:
              "7:30 PM & 8:30 PM Cuban Salsa & Rueda classes (all levels) plus full entry to the social dance fiesta until midnight.",
            priceInCents: 1200,
            totalCapacity: 60,
            maxLeads: 30,
            maxFollows: 30,
            salesEndAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Social Dancing Fiesta Only (From 9:30 PM)",
            description:
              "Club social dance entry with DJ Enrique spinning 100% authentic Cuban Timba, Son, and Bachata.",
            priceInCents: 600,
            totalCapacity: 100,
            salesEndAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
    include: { ticketTiers: true },
  });

  // Event 3: Halloween Fancy Dress Latin Party (Saturday 31st October 2026)
  const halloweenEvent = await prisma.event.create({
    data: {
      slug: "halloween-fancy-dress-latin-party-2026",
      title: "★ HALLOWEEN FANCY DRESS PARTY ★ — South Coast Cuban & Latin Night",
      description:
        "The South Coast’s premier Cuban Dance event, Halloween Fancy Dress Edition! Alex Spindlove is bringing The Bachata flavour to our Halloween party. A night dedicated to Cuban, Latin, Kizomba music & dance featuring top South Coast teachers Anna, Alex (BOH Studios) PLUS The Salsa Explosion team (Enrique, Moe Flex, Justyna, Arturas & Jim) with DJ Enrique SB&K Night. Best costume prizes: 1st Prize - 1 Made in Cuba Weekend, 2nd Prize - 2 Free Dance Classes, 3rd Prize - 1 Free Entry to Our Party!",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate: new Date("2026-10-31T20:00:00Z"),
      endDate: new Date("2026-11-01T02:00:00Z"),
      guestArtists: ["Alex Spindlove", "Anna", "Enrique Perez Valdes", "Moe Flex", "DJ Enrique"],
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

  // Event 4: Cuban Sundays Sunset Social & Workshop
  const cubanSundaysEvent = await prisma.event.create({
    data: {
      slug: "cuban-sundays-sunset-social",
      title: "Cuban Sundays: Sunset Social & Styling Workshop",
      description:
        "End your weekend with the ultimate Cuban dance fix! Afro-Cuban body movement and Cuban Son styling workshops from 6:00 PM, followed by relaxed social dancing with DJ Enrique spinning classic Casino, Changüí, and Son.",
      venueName: "BOH Studios Bournemouth",
      venueAddress: "104 Commercial Rd, Bournemouth, BH2 5LR",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      guestArtists: ["Enrique Perez Valdes", "Justyna", "Arturas", "DJ Enrique"],
      status: EventStatus.PUBLISHED,
      ticketTiers: {
        create: [
          {
            name: "Workshop Intensive & Social Pass",
            description:
              "6:00 PM & 7:00 PM styling & Rueda workshops + Sunday evening social dance.",
            priceInCents: 1000,
            totalCapacity: 50,
            maxLeads: 25,
            maxFollows: 25,
            salesEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            name: "Sunday Social Only Entry (From 8:00 PM)",
            description:
              "Social dance admission with resident Cuban DJs.",
            priceInCents: 500,
            totalCapacity: 80,
            salesEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
          qrCodeHash: "SE-PASS-SOFIA-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 9500,
          checkedIn: false,
        },
        {
          userId: student4.id,
          eventId: guestEvent.id,
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
          eventId: guestEvent.id,
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

  // Seed sample registrations for Made in Cuba Thursday
  const madeInCubaTier = madeInCubaEvent.ticketTiers[0];
  if (madeInCubaTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student2.id,
          eventId: madeInCubaEvent.id,
          ticketTierId: madeInCubaTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-THU-DAVID-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 1200,
          checkedIn: false,
        },
        {
          userId: student3.id,
          eventId: madeInCubaEvent.id,
          ticketTierId: madeInCubaTier.id,
          role: DanceRole.FOLLOW,
          qrCodeHash: "SE-THU-CAMILA-002",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 1200,
          checkedIn: true,
          checkedInAt: new Date(),
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

  // Seed sample registrations for Cuban Sundays Sunset Social
  const sundayTier = cubanSundaysEvent.ticketTiers[0];
  if (sundayTier) {
    await prisma.eventRegistration.createMany({
      data: [
        {
          userId: student6.id,
          eventId: cubanSundaysEvent.id,
          ticketTierId: sundayTier.id,
          role: DanceRole.LEAD,
          qrCodeHash: "SE-SUN-JAMES-001",
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: 1000,
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
