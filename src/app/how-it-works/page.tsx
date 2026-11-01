import Link from "next/link";
import {
  Flame,
  Users,
  Award,
  CreditCard,
  QrCode,
  Video,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Share2,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { LaunchTourButton } from "@/components/onboarding/launch-tour-button";
import { CubanCurriculumSkillTree } from "@/components/progression/cuban-curriculum-skill-tree";
import { CubanDanceGearsMatrix } from "@/components/progression/cuban-dance-gears-matrix";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export const metadata = {
  title: "How It Works | Cuban Salsa Academy • Salsa Explosion",
  description:
    "Learn how Salsa Explosion balances Lead/Follow ratios with zero partners needed, advances students through a 4-tier Cuban syllabus, provides AI video feedback, and offers 1-second QR door check-in.",
};

export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Hero Header — Poster Architecture */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>STUDENT HANDBOOK &amp; STUDIO ARCHITECTURE</span>
          <span className="opacity-70">CUBAN SALSA &amp; RUEDA DE CASINO</span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className={KICKER}>Transparent Studio System</p>
            <h1 className={`${TYPE.section} text-ink`}>
              HOW SALSA EXPLOSION <span className="text-poster-red">POWERS YOUR DANCE</span>
            </h1>
            <p className="max-w-2xl text-sm font-semibold text-ink/80 leading-relaxed">
              Traditional dance studios struggle with unbalanced classes, long door queues, and forgotten moves. Salsa Explosion provides a seamless studio system built specifically for Cuban Salsa academies, social dancers, and visiting masterclasses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LaunchTourButton
              size="lg"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.mustard} text-xs font-bold min-h-[40px] px-4 shadow-[3px_3px_0_0_#161311]`}
              label="Launch 60-Second Interactive Tour"
            />
            <Link
              href="/dashboard/schedule"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold min-h-[40px] px-4 inline-flex items-center gap-1.5`}
            >
              <span>View Class Schedule</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <p className={`${KICKER} text-poster-red`}>
            The Salsa Explosion Difference
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            5 Principles That Make Every Class Electric
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 font-medium">
            From the moment you book your spot to the end-of-class video recap, here is how the platform works behind the scenes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pillar 1: No Partner Needed */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-teal text-ink">
                <Users className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311] inline-block">
                1. Role Balance Guarantee
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                No Partner Required — Ever!
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                In Cuban Salsa (Casino &amp; Rueda de Casino), we dance in a rotating circle. Salsa Explosion dynamically monitors <strong>Lead</strong> vs <strong>Follow</strong> reservations in real time. If one role reaches capacity, reservations pause until the opposite role books. You will spend your class dancing, never sitting out!
              </p>
            </div>
            <div className="border-2 border-ink bg-poster-mustard/20 p-3 space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span>🕺 Lead Role</span>
                <span className="font-black text-ink">✓ 50/50 Balanced</span>
                <span>💃 Follow Role</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-2 border border-ink bg-ink" />
                <div className="h-2 border border-ink bg-poster-red" />
              </div>
            </div>
          </div>

          {/* Pillar 2: Studio Wallet & Door Pay */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-mustard text-ink">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs uppercase px-2 py-0.5 inline-block shadow-[2px_2px_0_0_#161311]">
                2. Transparent Door Pricing
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Pay at Door &amp; Festival Passes
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Weekly classes are paid directly at the door (£12 for 1 class / £14 for 2 classes, card or cash). Official festival passes and gift vouchers can be booked online via Stripe.
              </p>
            </div>
            <div className="border-2 border-ink bg-poster-teal/20 p-3 text-xs flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-poster-teal shrink-0 mt-0.5" />
              <span className="text-ink/85 font-medium leading-snug">
                <strong className="text-ink">12-Hour Cancellation Window:</strong> Cancel at least 12 hours before class and your credit is immediately returned to your wallet automatically.
              </span>
            </div>
          </div>

          {/* Pillar 3: 4-Tier Syllabus */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-red text-paper">
                <Award className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311] inline-block">
                3. Structured Curriculum
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                4-Tier Syllabus &amp; Video Review
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                No guessing which class to attend! Progress from <strong>Beginner</strong> (Casino basic &amp; Dile Que No) through <strong>Improver</strong>, <strong>Intermediate</strong> (Setenta &amp; Havana turns), to <strong>Advanced</strong> (Timba &amp; Guaguancó). Teachers promote you in class!
              </p>
            </div>
            <div className="border-2 border-ink bg-poster-mustard/20 p-2.5 text-xs font-bold text-ink flex items-center justify-between">
              <span>Beginner → Improver → Intermediate → Advanced</span>
              <Sparkles className="h-3.5 w-3.5 text-poster-red" />
            </div>
          </div>

          {/* Pillar 4: Contactless Door Check-In */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-teal text-ink">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311] inline-block">
                4. Door Arrival
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                1-Second QR Pass &amp; Fast Desk
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                When booking online passes, your dynamic QR door pass is created instantly on your device. When arriving at BOH Studios, show your phone or give your name for instant check-in.
              </p>
            </div>
            <div className="border-2 border-ink bg-paper p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Share2 className="h-3.5 w-3.5 text-poster-red" />
                <span>9:16 Instagram Story Badges</span>
              </div>
              <p className="text-xs text-ink/75 font-medium leading-snug">
                Unlock a new syllabus tier and get a personalized social card to celebrate your progress.
              </p>
            </div>
          </div>

          {/* Pillar 5: End-of-Class Video Recaps */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-blue text-paper">
                <Video className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311] inline-block">
                5. Memory Vault
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                End-of-Class Recap Vault
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                Never lose a routine in your camera roll again! At the end of class, instructors upload a 30-second video demonstrating the Cuban combination practiced with slow-mo controls.
              </p>
            </div>
            <Link
              href="/dashboard/recaps"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold w-full min-h-[40px] flex items-center justify-center gap-1.5`}
            >
              Explore Class Recaps
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 6: Visiting Maestros & Events */}
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 text-ink shadow-[4px_4px_0_0_#161311] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-poster-mustard text-ink">
                <Flame className="h-5 w-5" />
              </div>
              <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311] inline-block">
                6. Guest Artists &amp; Bootcamps
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Zero-Fee Masterclass Ticketing
              </h3>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                International Cuban maestras and maestros host weekend intensives, bootcamps, and socials at our academy. Buy full passes or party tickets directly with zero third-party markups.
              </p>
            </div>
            <Link
              href="/events"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold w-full min-h-[40px] flex items-center justify-center gap-1.5`}
            >
              Upcoming Masterclasses
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Silkscreen Step Cards (1, 2, 3, 4) with bold ink numbers */}
      <section className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311] space-y-6">
        <div className="border-b-4 border-ink pb-4 space-y-1">
          <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 shadow-[2px_2px_0_0_#161311] inline-block">
            Step-by-Step Experience
          </span>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card} pt-1`}>
            Your First Class: What to Expect
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 font-medium">
            A frictionless 4-step workflow designed to take you from arrival to dancing in the Rueda circle.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-4 border-ink bg-paper p-5 shadow-[4px_4px_0_0_#161311] space-y-2">
            <div className={`font-display font-black text-5xl text-poster-red leading-none`}>
              01
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">Select Your Role</h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Choose <strong>Lead</strong> or <strong>Follow</strong> on arrival. We maintain real-time ratio balance so everyone dances.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 shadow-[4px_4px_0_0_#161311] space-y-2">
            <div className={`font-display font-black text-5xl text-poster-red leading-none`}>
              02
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">Pay at the Door</h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Pay £12 (1 Class) or £14 (2 Classes &amp; Social Fiesta) with cash or card directly at BOH Studios desk.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 shadow-[4px_4px_0_0_#161311] space-y-2">
            <div className={`font-display font-black text-5xl text-poster-red leading-none`}>
              03
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">Join the Circle</h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Step straight onto the Canadian maple sprung dance floor. No partner needed — we rotate continuously!
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 shadow-[4px_4px_0_0_#161311] space-y-2">
            <div className={`font-display font-black text-5xl text-poster-red leading-none`}>
              04
            </div>
            <h3 className="font-display font-black text-base uppercase text-ink">Review &amp; Level Up</h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Watch your maestro&apos;s recap video at home, review Cuban figure names, and get promoted to the next tier!
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink">
          <div className="space-y-1">
            <span className="text-xs font-bold text-ink block">Prefer a hands-on preview right now?</span>
            <span className="text-xs text-ink/75 font-medium">Test role switching, ratio bars, and door check-in inside our interactive modal.</span>
          </div>
          <LaunchTourButton />
        </div>
      </section>

      {/* 2027 Modern Cuban Salsa Curriculum: 4-Level Skill Tree & Gears Matrix */}
      <section className="space-y-8" aria-label="Cuban Salsa Syllabus and Musicality Roadmap">
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <p className={`${KICKER} text-poster-red`}>
            Official 2027 Modern Curriculum
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            Clear Progression from Day 1 to Timba Mastery
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 font-medium">
            Explore our structured 4-level taxonomy, track figures across 5 dance pillars, and learn how to shift musical gears with authentic Cuban songs.
          </p>
        </div>

        <CubanCurriculumSkillTree defaultLevel="Beginner" />

        <CubanDanceGearsMatrix initiallyCollapsed={true} />
      </section>

      {/* Staff & Faculty Operations Guide */}
      <section
        data-testid="staff-operations-guide"
        aria-label="Teacher and Door Staff Operations Guide"
        className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[6px_6px_0_0_#161311] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-ink pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-ink bg-paper text-ink text-xs font-bold uppercase tracking-wider px-2 py-0.5">
                Staff Operations
              </span>
              <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs px-2 py-0.5">
                Enrique &amp; Teachers Guide
              </span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-ink mt-2">
              How Teachers &amp; Door Staff Run Class Check-In
            </h2>
            <p className="text-xs sm:text-sm text-ink font-medium mt-0.5">
              Designed for Maestro Enrique, Moe Flex, Justyna, Arturas, and Jim. Run seamless door entry right from your phone.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/instructor/roster"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold min-h-[40px] px-3 inline-flex items-center`}
            >
              Open Studio Roster
            </Link>
            <Link
              href="/admin/operations"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold min-h-[40px] px-3 inline-flex items-center`}
            >
              Desk Ops
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          <div className="border-2 border-ink bg-paper p-4 space-y-2 text-ink">
            <div className="flex items-center gap-2 font-bold text-sm">
              <QrCode className="h-4 w-4 text-poster-red" />
              <span>1. Self-Serve Door QR</span>
            </div>
            <p className="text-ink/80 leading-relaxed font-medium">
              Open your class on <Link href="/instructor/roster" className="font-bold underline text-ink">/instructor/roster</Link> and tap <strong>&ldquo;Door QR&rdquo;</strong> on your phone. Students scan the screen or table placard on arrival and check in within 1 second.
            </p>
          </div>

          <div className="border-2 border-ink bg-paper p-4 space-y-2 text-ink">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Flame className="h-4 w-4 text-poster-red" />
              <span>2. Live Camera Scanner</span>
            </div>
            <p className="text-ink/80 leading-relaxed font-medium">
              Tap <strong>&ldquo;Open Camera Door Scanner&rdquo;</strong> to activate your phone&apos;s rear camera. Point at any student pass (<code className="border border-ink bg-poster-mustard/30 px-1 font-mono">RF-PASS-...</code>) for instant automatic admission.
            </p>
          </div>

          <div className="border-2 border-ink bg-paper p-4 space-y-2 text-ink">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Users className="h-4 w-4 text-poster-teal" />
              <span>3. 1-Tap Manual &amp; A4 Backup</span>
            </div>
            <p className="text-ink/80 leading-relaxed font-medium">
              For seniors or walk-ins without smartphones, simply tap the checkmark next to their name. If venue Wi-Fi drops, print the A4 register beforehand with 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="border-b-4 border-ink pb-3 space-y-1">
          <p className={`${KICKER} text-poster-red`}>
            Frequently Asked Questions
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            Got Questions? We&apos;ve Got Answers.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-2 border-ink bg-paper p-5 shadow-[3px_3px_0_0_#161311] space-y-2 text-ink">
            <h3 className="font-display font-black text-base uppercase text-ink">
              Do I really not need a dance partner?
            </h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Yes, 100%! Cuban Salsa (Casino) is social and conversational. In Rueda de Casino, dancers rotate constantly. Salsa Explosion caps bookings so that the number of Leads and Follows matches, ensuring everyone gets equal partner time.
            </p>
          </div>

          <div className="border-2 border-ink bg-paper p-5 shadow-[3px_3px_0_0_#161311] space-y-2 text-ink">
            <h3 className="font-display font-black text-base uppercase text-ink">
              Can I switch between Lead and Follow?
            </h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Absolutely! Many dancers enjoy learning both roles. You can toggle your role on each individual class booking, provided spots for that role remain open.
            </p>
          </div>

          <div className="border-2 border-ink bg-paper p-5 shadow-[3px_3px_0_0_#161311] space-y-2 text-ink">
            <h3 className="font-display font-black text-base uppercase text-ink">
              What happens if I need to cancel my class?
            </h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              If you cancel at least 12 hours prior to class start time, your credit is immediately refunded back to your Studio Wallet. Late cancellations (under 12h) forfeit the credit so that other dancers on the waitlist have time to claim the spot.
            </p>
          </div>

          <div className="border-2 border-ink bg-paper p-5 shadow-[3px_3px_0_0_#161311] space-y-2 text-ink">
            <h3 className="font-display font-black text-base uppercase text-ink">
              How does the AI Dance Co-Pilot work?
            </h3>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              When submitting a 30-second practice clip for level progression, our multimodal AI evaluates clave timing, arm tension, and footwork rhythm against the Cuban syllabus rubric. Your teacher reviews the evaluation and confirms your promotion.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-4 border-ink bg-poster-mustard p-8 sm:p-10 text-center space-y-4 shadow-[8px_8px_0_0_#161311] text-ink">
        <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.section}`}>
          Ready to Step into the Rueda Circle?
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm font-bold text-ink/80 leading-relaxed">
          Join hundreds of Cuban Salsa dancers mastering timing, partner connection, and turn knots every week.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/schedule"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs sm:text-sm font-bold min-h-[44px] px-6 inline-flex items-center gap-1.5`}
          >
            Book Your Spot
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs sm:text-sm font-bold min-h-[44px] px-6 inline-flex items-center`}
          >
            View Class Pass Options
          </Link>
        </div>
      </section>
    </main>
  );
}
