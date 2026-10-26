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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import { LaunchTourButton } from "@/components/onboarding/launch-tour-button";
import { CubanCurriculumSkillTree } from "@/components/progression/cuban-curriculum-skill-tree";
import { CubanDanceGearsMatrix } from "@/components/progression/cuban-dance-gears-matrix";

export const metadata = {
  title: "How It Works | Cuban Salsa Academy • Salsa Explosion",
  description:
    "Learn how Salsa Explosion balances Lead/Follow ratios with zero partners needed, advances students through a 4-tier Cuban syllabus, provides AI video feedback, and offers 1-second QR door check-in.",
};

export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Hero Header — "The Place" Havana Nocturne Architecture */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-800 bg-canvas p-6 sm:p-12 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-[11px] font-black uppercase tracking-widest text-amber-300">
          <span>STUDENT HANDBOOK &amp; STUDIO ARCHITECTURE</span>
          <span className="text-ivory-muted font-bold">CUBAN SALSA &amp; RUEDA DE CASINO</span>
        </div>

        <div className="mt-6 max-w-3xl space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none text-white">
            How Salsa Explosion{" "}
            <span className="font-display italic font-normal text-amber-300 normal-case">
              Powers Your Dance Journey
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed font-medium">
            Traditional dance studios struggle with unbalanced classes, lost cash, long door queues, and forgotten moves. Salsa Explosion provides a seamless studio system built specifically for Cuban Salsa academies, social dancers, and visiting masterclasses.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <LaunchTourButton
              size="lg"
              className="bg-amber-400 text-stone-950 hover:bg-amber-300 font-extrabold shadow-md text-xs sm:text-sm h-11 rounded-xl"
              label="Launch 60-Second Interactive Tour"
            />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs sm:text-sm h-11 rounded-xl backdrop-blur-xs"
            >
              <Link href="/dashboard/schedule">
                View Class Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="text-xs font-bold border-amber-500/40 text-amber-400">
            The Salsa Explosion Difference
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            5 Principles That Make Every Class Electric
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            From the moment you book your spot to the end-of-class video recap, here is how the platform works behind the scenes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pillar 1: No Partner Needed */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-role-lead-soft text-role-lead">
                <Users className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-surface-3 text-ivory border border-role-lead-line text-[11px]">
                1. Role Balance Guarantee
              </Badge>
              <CardTitle className="text-lg font-bold">
                No Partner Required — Ever!
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                In Cuban Salsa (Casino & Rueda de Casino), we dance in a rotating circle. Salsa Explosion dynamically monitors <strong>Lead</strong> vs <strong>Follow</strong> reservations in real time. If one role reaches capacity, reservations pause until the opposite role books. You will spend your class dancing, never sitting out!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-role-lead">🕺 Lead Role</span>
                  <span className="text-success font-bold">✓ 50/50 Synchronized</span>
                  <span className="text-role-follow">💃 Follow Role</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-1.5 rounded-full bg-role-lead" />
                  <div className="h-1.5 rounded-full bg-role-follow" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 2: Studio Wallet & Credits */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <CreditCard className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-gold text-stone-950 font-bold text-[11px]">
                2. Studio Wallet & Packs
              </Badge>
              <CardTitle className="text-lg font-bold">
                1-Tap Booking & Fair Cancellations
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Weekly classes are paid directly at the door (£12 for 1 class / £14 for 2 classes, card or cash). Official festival passes and gift vouchers can be booked online via Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border border-success-line bg-success-soft p-3 text-xs flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-snug">
                  <strong>12-Hour Cancellation Window:</strong> Cancel at least 12 hours before class and your credit is immediately returned to your wallet automatically.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 3: 4-Tier Syllabus & AI Co-Pilot */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
                <Award className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-surface-3 text-ivory border border-success-line text-[11px]">
                3. Structured Curriculum
              </Badge>
              <CardTitle className="text-lg font-bold">
                4-Tier Syllabus & AI Video Feedback
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                No guessing which class to attend! Progress from <strong>Beginner</strong> (Casino basic & Dile Que No) through <strong>Improver</strong>, <strong>Intermediate</strong> (Setenta & Havana turns), to <strong>Advanced</strong> (Timba & Guaguancó). Teachers promote you in class, or you can submit a 30s practice clip for AI Co-Pilot grading!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-muted/30 p-2.5 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                <span>Beginner → Improver → Intermediate → Advanced</span>
                <Sparkles className="h-3.5 w-3.5 text-gold" />
              </div>
            </CardContent>
          </Card>

          {/* Pillar 4: 1-Second QR Check-In */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <QrCode className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-surface-3 text-ivory border border-gold/30 text-[11px]">
                4. Contactless Door Check-In
              </Badge>
              <CardTitle className="text-lg font-bold">
                1-Second QR Pass & Social Badges
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                When you book, your dynamic QR door pass is created instantly on your device. When arriving at the studio, show your phone to the instructor or scan the door station for instant check-in. Works flawlessly even in basement studios with spotty cellular reception.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-muted/30 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-gold font-bold">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>9:16 Instagram Story Badges</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Unlock a new syllabus tier and get a personalized social card to celebrate your progress with the community.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 5: End-of-Class Video Recaps */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Video className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-surface-3 text-ivory border border-gold/30 text-[11px]">
                5. Memory Vault
              </Badge>
              <CardTitle className="text-lg font-bold">
                End-of-Class Recap Vault
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Never lose a routine in your camera roll again! At the end of class, instructors upload a 30-second video demonstrating the Cuban combination practiced. Attended students unlock permanent access in their personal library with 0.75x slow-mo footwork controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                <Link href="/dashboard/recaps">
                  Explore Class Recaps
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pillar 6: Visiting Maestros & Events */}
          <Card className="border-border shadow-xs hover:border-gold/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ember/15 text-ember">
                <Flame className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-surface-3 text-ivory border border-ember/30 text-[11px]">
                6. Guest Artists & Bootcamps
              </Badge>
              <CardTitle className="text-lg font-bold">
                Zero-Fee Masterclass Ticketing
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                International Cuban maestras and maestros host weekend intensives, bootcamps, and socials at our academy. Buy full passes or party tickets directly with zero third-party ticketing markups, and receive cryptographic door barcodes immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                <Link href="/events">
                  Upcoming Masterclasses
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Step-by-Step Walkthrough Container */}
      <section className="rounded-3xl border bg-card p-6 sm:p-10 space-y-8 shadow-xs">
        <div className="space-y-2">
          <Badge className="bg-amber-500 text-stone-950 font-bold text-xs">
            Step-by-Step Experience
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your First Class: What to Expect from Start to Finish
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A frictionless 4-step workflow designed to take you from sign-up to dancing in the Rueda circle.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-stone-950 text-xs">
              1
            </div>
            <h3 className="font-bold text-sm">Select Your Role</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose <strong>Lead</strong> or <strong>Follow</strong> on the class card. Salsa Explosion validates real-time role ratios to keep the class balanced.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-stone-950 text-xs">
              2
            </div>
            <h3 className="font-bold text-sm">Use 1 Wallet Credit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Book with 1 tap using credits or an active monthly subscription. Receive immediate calendar confirmation.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-stone-950 text-xs">
              3
            </div>
            <h3 className="font-bold text-sm">Scan QR at the Door</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Arrive at the studio, show your pass on your smartphone. Your teacher scans your barcode in 1 second.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-stone-950 text-xs">
              4
            </div>
            <h3 className="font-bold text-sm">Review & Level Up</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Watch your maestro&apos;s recap video at home, review Cuban figure names, and submit practice clips to advance to Tier 2!
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t">
          <div className="space-y-1">
            <span className="text-xs font-bold block">Prefer a hands-on preview right now?</span>
            <span className="text-xs text-muted-foreground">Test role switching, ratio bars, and door check-in inside our interactive modal.</span>
          </div>
          <LaunchTourButton />
        </div>
      </section>

      {/* 2027 Modern Cuban Salsa Curriculum: 4-Level Skill Tree & Gears Matrix */}
      <section className="space-y-8" aria-label="Cuban Salsa Syllabus and Musicality Roadmap">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="text-xs font-bold border-amber-500/40 text-amber-400">
            Official 2027 Modern Curriculum
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clear Progression from Day 1 to Timba Mastery
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
        className="rounded-3xl border border-gold/30 bg-surface-2 p-6 sm:p-10 space-y-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-base text-white text-[11px] font-black uppercase tracking-wider">
                Staff Operations
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-bold text-xs">
                Enrique & Teachers Guide
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-2">
              How Teachers & Door Staff Run Class Check-In
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              Designed for Maestro Enrique, Moe Flex, Justyna, Arturas, and Jim. Run seamless door entry right from your phone.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="bg-primary-base text-white hover:bg-primary-hover font-bold text-xs">
              <Link href="/instructor/roster">Open Studio Roster</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
              <Link href="/admin/operations">Desk Ops</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl border bg-card/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <QrCode className="h-4 w-4" />
              <span>1. Self-Serve Door QR</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Open your class on <Link href="/instructor/roster" className="font-bold underline text-foreground">/instructor/roster</Link> and tap <strong>&ldquo;Door QR&rdquo;</strong> on your phone. Students scan the screen or table placard on arrival and check in within 1 second.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
              <Flame className="h-4 w-4" />
              <span>2. Live Camera Scanner</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tap <strong>&ldquo;Open Camera Door Scanner&rdquo;</strong> to activate your phone&apos;s rear camera. Point at any student pass (<code className="bg-muted px-1 rounded font-mono">RF-PASS-...</code>) for instant automatic admission.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <Users className="h-4 w-4" />
              <span>3. 1-Tap Manual & A4 Backup</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For seniors or walk-ins without smartphones, simply tap the green checkmark next to their name. If venue Wi-Fi drops, print the A4 register beforehand with 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs font-bold">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Got Questions? We&apos;ve Got Answers.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Do I really not need a dance partner?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Yes, 100%! Cuban Salsa (Casino) is social and conversational. In Rueda de Casino, dancers rotate constantly. Salsa Explosion caps bookings so that the number of Leads and Follows matches, ensuring everyone gets equal partner time.
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Can I switch between Lead and Follow?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Absolutely! Many dancers enjoy learning both roles. You can toggle your role on each individual class booking, provided spots for that role remain open.
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                What happens if I need to cancel my class?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              If you cancel at least 12 hours prior to class start time, your credit is immediately refunded back to your Studio Wallet. Late cancellations (under 12h) forfeit the credit so that other dancers on the waitlist have time to claim the spot.
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                How does the AI Dance Co-Pilot work?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              When submitting a 30-second practice clip for level progression, our multimodal AI evaluates clave timing, arm tension, and footwork rhythm against the Cuban syllabus rubric. Your teacher reviews the evaluation and confirms your promotion.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="rounded-3xl border border-line bg-surface-2 p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Step into the Rueda Circle?
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground">
          Join hundreds of Cuban Salsa dancers mastering timing, partner connection, and turn knots every week.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-xs sm:text-sm shadow-md">
            <Link href="/dashboard/schedule">
              Book Your Spot
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-xs sm:text-sm font-semibold">
            <Link href="/pricing">View Class Pass Options</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
