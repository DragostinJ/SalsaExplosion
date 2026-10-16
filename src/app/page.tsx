import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Calendar,
  Sparkles,
  Award,
  Video,
  ArrowRight,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">
                RitmoFlow
              </span>
              <span className="hidden ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Cuban Salsa Studio
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard/schedule"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Schedule
            </Link>
            <Link
              href="/pricing"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Passes & Pricing
            </Link>

            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Join Studio
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link href="/dashboard/progression">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                    Progression
                  </Button>
                </Link>
                <UserButton />
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-primary/[0.04] to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="outline"
              className="mb-6 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3.5 py-1 text-xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Salsa Casino & Rueda de Casino Specialty Studio
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-tight">
              Master the Rhythm. <br />
              <span className="bg-gradient-to-r from-primary to-rose-600 bg-clip-text text-transparent">
                Unlock Every Level.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RitmoFlow is a dedicated Cuban Salsa platform featuring level-gated classes,
              strict Lead/Follow partner balance, and video technique reviews by studio instructors.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold">
                <Link href="/dashboard/schedule">
                  View Class Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold">
                <Link href="/pricing">
                  Class Passes & Membership
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 sm:py-24 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built Specifically for Partner Dancers
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No overcrowded classes, no partner shortages, and clear milestones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Balanced Lead & Follow Ratios</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Real-time role caps prevent partner shortages. Book as a Lead or Follow with live spot tracking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Level-Gated Progression</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Classes are strictly leveled: Beginner, Improver, Intermediate, and Advanced. You learn alongside dancers at your exact stage.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Video Technique Reviews</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Upload a 60-second video of your Cuban basic, Dile Que No, or Setenta to receive personalized feedback and level promotions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RitmoFlow Cuban Salsa Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/schedule" className="hover:underline">Schedule</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
            <Link href="/instructor/submissions" className="hover:underline">Instructor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
