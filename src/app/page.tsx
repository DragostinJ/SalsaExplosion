import Link from "next/link";
import {
  Calendar,
  Award,
  Video,
  ArrowRight,
  QrCode,
  BarChart3,
  Users,
  ShieldCheck,
  MapPin,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SocialProofGrid } from "@/components/marketing/social-proof-grid";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const upcomingEvents = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" },
    take: 3,
    include: {
      ticketTiers: {
        orderBy: { priceInCents: "asc" },
      },
    },
  });

  const now = new Date();
  const nextClasses = await prisma.classSession.findMany({
    where: {
      startTime: { gt: now },
      isCancelled: false,
    },
    orderBy: { startTime: "asc" },
    take: 3,
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "ATTENDED"] },
        },
        select: {
          id: true,
          danceRole: true,
        },
      },
    },
  });
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-primary-light/40 via-background to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Social Proof & Award Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge
                variant="outline"
                className="border-primary-base/30 bg-primary-light text-primary-hover px-3.5 py-1 text-xs font-semibold"
              >
                <Award className="mr-1.5 h-3.5 w-3.5 text-primary-base" />
                Salsa UK Lifetime Achievement Award Winner
              </Badge>
              <Badge
                variant="outline"
                className="border-secondary-base/30 bg-secondary-light/40 text-secondary-hover px-3.5 py-1 text-xs font-semibold"
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
                Home Hub: BOH Studios Bournemouth
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-tight">
              Bournemouth&apos;s Authentic Cuban Salsa Academy.{" "}
              <span className="block mt-1 bg-gradient-to-r from-primary-base via-accent-tangerine to-primary-base bg-clip-text text-transparent">
                Directed by Enrique Perez Valdes.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Welcome to Salsa Explosion UK. Experience 25+ years of authentic Cuban Casino, Rueda de Casino, and Son with role-balanced partner rotations, 4-tier syllabus tracking, student recap videos, and official congress passes.
            </p>

            {/* Quick Stats Pill Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-text-muted font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-secondary-base" />
                <span>4,200+ Dancers in Community</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-secondary-base" />
                <span>25+ Years Cuban Salsa Heritage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-secondary-base" />
                <span>Zero Partner Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-secondary-base" />
                <span>Strict Lead/Follow Balance</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-sm font-bold bg-primary-base text-white shadow-md shadow-primary-base/20 hover:bg-primary-hover"
              >
                <Link href="/dashboard/schedule">
                  View Weekly Classes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 text-sm font-semibold border-secondary-base/40 text-secondary-hover hover:bg-secondary-light/40"
              >
                <Link href="/events">
                  <Flame className="mr-2 h-4 w-4 text-accent-tangerine" />
                  Bournemouth Congress 2026
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 text-sm font-semibold"
              >
                <Link href="/about">Maestro Enrique Story</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-12 px-7 text-sm font-semibold"
              >
                <Link href="/instructor/students">Instructor Desk</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Live "Next Up This Week" Class Strip (Instant Speed-to-Value on Mobile) */}
        {nextClasses.length > 0 && (
          <section className="border-b bg-card py-6 shadow-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Live Studio Floor
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                    Next Classes This Week at BOH Studios
                  </h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary-base hover:text-primary-hover p-0 sm:px-2">
                  <Link href="/dashboard/schedule">
                    Full Weekly Timetable →
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {nextClasses.map((cls) => {
                  const dateFormatted = new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  }).format(new Date(cls.startTime));

                  const spotsLeft = Math.max(0, cls.maxCapacity - cls.bookings.length);
                  const isAlmostFull = spotsLeft <= 4;

                  return (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3.5 hover:border-primary-base/40 hover:bg-muted/50 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">
                            {cls.minLevel}
                          </span>
                          <span className="text-[11px] font-semibold text-text-muted">
                            {dateFormatted}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {cls.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          with {cls.instructor.firstName} •{" "}
                          <span className={isAlmostFull ? "text-accent-tangerine font-bold" : "text-emerald-600 font-medium"}>
                            {spotsLeft} spots left
                          </span>
                        </p>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="shrink-0 h-9 px-3.5 text-xs font-bold bg-primary-base hover:bg-primary-hover text-white shadow-xs"
                      >
                        <Link href="/dashboard/schedule">
                          Book Spot
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Featured Congress Callout Banner */}
        <section className="py-8 bg-gradient-to-r from-amber-950/40 via-background to-orange-950/30 border-y border-amber-500/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-amber-500/30 bg-card/60 backdrop-blur-sm p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2">
                  <Badge className="bg-primary-base text-white font-bold text-xs uppercase tracking-wider">
                    Official Flagship Event
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">July 17–19, 2026</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Bournemouth Summer Cuban Salsa Congress 2026
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  3 days of authentic Cuban masterclasses, Rueda de Casino, Havana nights social dancing, and world-class guest artists featuring Enrique Perez Valdes, Yaniel Castillo, and Elena Reyes at The Roundhouse Hotel & BOH Studios Bournemouth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold px-6"
                >
                  <Link href="/events">
                    Reserve Passes (From £20)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="/events">View Artist Lineup</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Social Proof & Media Grid */}
        <SocialProofGrid />

        {/* Incoming Events & Social Parties Showcase */}
        {upcomingEvents.length > 0 && (
          <section className="py-14 border-t bg-gradient-to-b from-background via-primary-base/[0.02] to-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <Badge variant="outline" className="text-xs font-bold mb-2 border-primary-base/30 text-rose-800 dark:text-rose-300 bg-primary-light/60">
                    Live Event Calendar
                  </Badge>
                  <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight">
                    Upcoming Salsa Explosion Nights & Festivals
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    From weekly Thursday parties at BOH Studios to flagship weekend Congresses in Bournemouth.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 text-xs font-bold border-primary-base/30 text-rose-700 dark:text-rose-300 hover:bg-primary-base hover:text-white transition-colors">
                  <Link href="/events">
                    Browse All Passes & Events
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {upcomingEvents.map((evt) => {
                  const minPrice = evt.ticketTiers[0]?.priceInCents
                    ? `£${(evt.ticketTiers[0].priceInCents / 100).toFixed(0)}`
                    : "TBA";

                  const startFormatted = new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(evt.startDate));

                  return (
                    <Card
                      key={evt.id}
                      className="flex flex-col overflow-hidden border shadow-xs hover:shadow-md transition-all group hover:border-primary-base/50"
                    >
                      <div className="relative h-36 w-full bg-gradient-to-tr from-primary-base via-rose-600 to-accent-tangerine p-5 text-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-black/40 text-white border-none text-[10px] backdrop-blur-sm">
                            {evt.slug.includes("congress") ? "Flagship Congress" : "Social Night & Class"}
                          </Badge>
                          <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            From {minPrice}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold leading-snug drop-shadow-sm line-clamp-2">
                          {evt.title}
                        </h3>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {evt.guestArtists.slice(0, 3).map((artist) => (
                            <Badge
                              key={artist}
                              variant="secondary"
                              className="text-[10px] bg-secondary-light text-secondary-hover font-bold border border-secondary-base/30"
                            >
                              ★ {artist}
                            </Badge>
                          ))}
                        </div>
                        <CardDescription className="line-clamp-2 text-xs">
                          {evt.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 space-y-1.5 text-xs text-muted-foreground flex-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{startFormatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-2 border-t">
                        <Button asChild size="sm" className="w-full text-xs font-bold bg-primary hover:bg-primary/90">
                          <Link href={`/events/${evt.slug}`}>
                            Reserve Pass
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 3-Portal Interactive Showcase */}
        <section className="py-14 border-t bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="text-xs font-semibold mb-2">
                Unified Ecosystem
              </Badge>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                One Platform for Dancers, Instructors & Academy Owners
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Built specifically for Cuban Salsa academies with distinct role permissions and live multi-tenant isolation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Portal 1: Student Experience */}
              <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    1. Dancer Experience
                  </Badge>
                  <h3 className="text-lg font-extrabold">
                    Bookings, Syllabus & Recaps
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Reserve Lead or Follow spots with automatic ratio protection, watch post-class video recaps from Maestro Enrique, track your 4-tier Cuban syllabus, and store your Congress QR pass.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/dashboard/schedule">Schedule</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/dashboard/recaps">Recaps</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/dashboard/progression">Progression</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/about">About Studio</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs border-primary-base/40 text-rose-800 dark:text-rose-200 font-bold bg-primary-light/50 hover:bg-primary-base hover:text-white transition-colors">
                    <Link href="/how-it-works">How It Works</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/events">Congress Passes</Link>
                  </Button>
                </div>
              </div>

              {/* Portal 2: Instructor Desk */}
              <div className="rounded-2xl border border-secondary-base/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-secondary-base/60 transition-colors">
                <div className="space-y-2">
                  <Badge className="bg-secondary-base text-white text-xs font-bold">
                    2. Instructor Teaching Desk
                  </Badge>
                  <h3 className="text-lg font-extrabold">
                    Progression, AI Co-Pilot & QR Roster
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    View every student&apos;s level, promote dancers in 1 click across Beginner to Advanced, grade video assessments with AI rubric feedback, and run lightning-fast QR door check-ins.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/students">
                      <Users className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
                      Students
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/submissions">
                      <Video className="mr-1.5 h-3.5 w-3.5 text-primary-base" />
                      AI Video Grader
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/roster">
                      <QrCode className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
                      QR Roster
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Portal 3: Studio Owner Admin */}
              <div className="rounded-2xl border border-accent-tangerine/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-accent-tangerine/60 transition-colors">
                <div className="space-y-2">
                  <Badge className="bg-accent-tangerine text-zinc-950 text-xs font-bold">
                    3. Studio Owner Command
                  </Badge>
                  <h3 className="text-lg font-extrabold">
                    Revenue Charts, Classes & Festivals
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monitor monthly recurring revenue, track Lead/Follow retention curves, schedule weekly Cuban classes at BOH Studios, and publish ticket tiers for visiting maestros.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/analytics">
                      <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-accent-tangerine" />
                      Analytics
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/classes">Classes</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/events">
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-accent-tangerine" />
                      Events Admin
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="py-16 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  Balanced Lead & Follow Ratios
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Row-locked PostgreSQL transactions enforce strict Lead and Follow caps on both weekly classes at BOH Studios and weekend congress bootcamps.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary-base mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  4-Tier Cuban Salsa Syllabus
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Clear progression from Beginner to Improver, Intermediate, and Advanced covering Guapea, Dile Que No, Setenta, Vacilala, and Rueda command mastery.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  Zero-Commission Congress Passes
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Sell Full Passes and Havana Fiesta social passes directly with Stripe integration and instant 1-second camera QR door verification.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
