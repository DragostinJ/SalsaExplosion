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

export const metadata = {
  title: "How It Works | Cuban Salsa Academy Operating System | RitmoFlow",
  description:
    "Learn how RitmoFlow balances Lead/Follow ratios with zero partners needed, advances students through a 4-tier Cuban syllabus, provides AI video feedback, and offers 1-second QR door check-in.",
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-8 sm:p-14 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm text-xs font-bold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
              Student Handbook & Studio Architecture
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-xs font-semibold">
              Cuban Salsa & Rueda de Casino
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight drop-shadow-sm">
            How RitmoFlow Powers Your Dance Journey
          </h1>

          <p className="text-base sm:text-lg text-amber-50/95 leading-relaxed font-normal">
            Traditional dance studios struggle with unbalanced classes, lost cash, long door queues, and forgotten moves. RitmoFlow is an all-in-one operating system built specifically for Cuban Salsa academies, social dancers, and visiting masterclasses.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <LaunchTourButton
              size="lg"
              className="bg-white text-zinc-950 hover:bg-amber-100 font-extrabold shadow-md text-xs sm:text-sm"
              label="Launch 60-Second Interactive Tour"
            />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-black/20 text-white hover:bg-black/30 font-bold text-xs sm:text-sm backdrop-blur-xs"
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
          <Badge variant="outline" className="text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-400">
            The RitmoFlow Difference
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
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-blue-700 text-white text-[11px]">
                1. Role Balance Guarantee
              </Badge>
              <CardTitle className="text-lg font-bold">
                No Partner Required — Ever!
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                In Cuban Salsa (Casino & Rueda de Casino), we dance in a rotating circle. RitmoFlow dynamically monitors <strong>Lead</strong> vs <strong>Follow</strong> reservations in real time. If one role reaches capacity, reservations pause until the opposite role books. You will spend your class dancing, never sitting out!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-blue-700 dark:text-blue-400">🕺 Lead Role</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">✓ 50/50 Synchronized</span>
                  <span className="text-rose-700 dark:text-rose-400">💃 Follow Role</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-1.5 rounded-full bg-blue-600" />
                  <div className="h-1.5 rounded-full bg-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 2: Studio Wallet & Credits */}
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-amber-500 text-zinc-950 font-bold text-[11px]">
                2. Studio Wallet & Packs
              </Badge>
              <CardTitle className="text-lg font-bold">
                1-Tap Booking & Fair Cancellations
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Purchase drop-in credits, 5 or 10 class packs, or unlimited monthly memberships securely via Stripe. Credits live in your Studio Wallet so booking any session takes 1 tap without repeated credit card entry.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 text-xs flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-snug">
                  <strong>12-Hour Cancellation Window:</strong> Cancel at least 12 hours before class and your credit is immediately returned to your wallet automatically.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 3: 4-Tier Syllabus & AI Co-Pilot */}
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-emerald-700 text-white text-[11px]">
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
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Pillar 4: 1-Second QR Check-In */}
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-400">
                <QrCode className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-purple-700 text-white text-[11px]">
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
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
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
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400">
                <Video className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-orange-700 text-white text-[11px]">
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
          <Card className="border-border shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-400">
                <Flame className="h-5 w-5" />
              </div>
              <Badge className="w-fit bg-rose-700 text-white text-[11px]">
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
          <Badge className="bg-amber-500 text-zinc-950 font-bold text-xs">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-zinc-950 text-xs">
              1
            </div>
            <h3 className="font-bold text-sm">Select Your Role</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose <strong>Lead</strong> or <strong>Follow</strong> on the class card. RitmoFlow validates real-time role ratios to keep the class balanced.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-zinc-950 text-xs">
              2
            </div>
            <h3 className="font-bold text-sm">Use 1 Wallet Credit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Book with 1 tap using credits or an active monthly subscription. Receive immediate calendar confirmation.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-zinc-950 text-xs">
              3
            </div>
            <h3 className="font-bold text-sm">Scan QR at the Door</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Arrive at the studio, show your pass on your smartphone. Your teacher scans your barcode in 1 second.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-extrabold text-zinc-950 text-xs">
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
              Yes, 100%! Cuban Salsa (Casino) is social and conversational. In Rueda de Casino, dancers rotate constantly. RitmoFlow caps bookings so that the number of Leads and Follows matches, ensuring everyone gets equal partner time.
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
      <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-orange-500/10 p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Step into the Rueda Circle?
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground">
          Join hundreds of Cuban Salsa dancers mastering timing, partner connection, and turn knots every week.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-xs sm:text-sm shadow-md">
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
