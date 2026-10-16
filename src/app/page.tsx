import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Award,
  Video,
  ArrowRight,
  QrCode,
  BarChart3,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-amber-500/[0.06] to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="outline"
              className="mb-6 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3.5 py-1 text-xs font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Cuban Salsa (Casino & Rueda de Casino) Studio Operating System
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-tight">
              Master the Clave. <br />
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Run the Entire Academy.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RitmoFlow combines role-balanced class bookings, 4-tier Cuban Salsa syllabus progression, AI-assisted video grading, QR door check-ins, and zero-commission guest artist event ticketing.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-500 text-white"
              >
                <Link href="/dashboard/schedule">
                  Class Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 text-sm font-semibold"
              >
                <Link href="/events">Guest Artist Events</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-12 px-7 text-sm font-semibold"
              >
                <Link href="/instructor/students">Instructor & Admin Hub</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 3-Portal Interactive Showcase */}
        <section className="py-12 border-t bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Portal 1: Student Experience */}
              <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    1. Dancer Experience
                  </Badge>
                  <h2 className="text-lg font-extrabold">
                    Bookings, Syllabus & Passes
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Book Lead or Follow spots, track your Cuban Salsa figures, upload assessment videos, and register for visiting maestro weekenders.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/dashboard/schedule">Schedule</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/dashboard/progression">Progression</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/events">Events</Link>
                  </Button>
                </div>
              </div>

              {/* Portal 2: Instructor Desk */}
              <div className="rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-emerald-600 text-white text-xs font-bold">
                    2. Instructor Teaching Desk
                  </Badge>
                  <h2 className="text-lg font-extrabold">
                    Progression, AI Co-Pilot & QR Roster
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    View every student&apos;s level, promote dancers in 1 click, grade videos with AI rubric assistance, and check in classes via QR code.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/students">
                      <Users className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      Students
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/submissions">
                      <Video className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                      AI Video Grader
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/instructor/roster">
                      <QrCode className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                      QR Roster
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Portal 3: Studio Owner Admin */}
              <div className="rounded-2xl border border-amber-500/30 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-amber-500 text-white text-xs font-bold">
                    3. Studio Owner Command
                  </Badge>
                  <h2 className="text-lg font-extrabold">
                    Revenue Charts, Classes & Events
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monitor monthly revenue, Lead/Follow balance, syllabus retention funnel, publish guest artist festivals, and scan door passes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/analytics">
                      <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                      Analytics
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/classes">Classes</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/admin/events">
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
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
                  Row-locked PostgreSQL transactions enforce strict Lead and Follow caps on both weekly classes and weekend bootcamps.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  4-Tier Cuban Salsa Syllabus
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Clear progression from Beginner to Improver, Intermediate, and Advanced covering Guapea, Dile Que No, Setenta, and Vacilala.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">
                  Zero-Commission Event Ticketing
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Sell Full Passes and Party Passes for visiting international Cuban maestros directly via Stripe with 1-second QR door verification.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4">
          © {new Date().getFullYear()} RitmoFlow Studio Operating System. Built for Cuban Salsa & Rueda de Casino.
        </div>
      </footer>
    </div>
  );
}
