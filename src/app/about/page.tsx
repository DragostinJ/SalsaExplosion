import Link from "next/link";
import {
  Flame,
  Users,
  Award,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Video,
} from "lucide-react";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { StudioGallery } from "@/components/about/studio-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "About Salsa Explosion | Cuban Salsa Academy & Community • Bournemouth, UK",
  description:
    "Discover Salsa Explosion UK, founded by Cuban maestro Enrique Perez Valdes. Learn authentic Cuban Salsa (Casino & Rueda de Casino) at BOH Studios Bournemouth.",
};

export default async function AboutPage() {
  // Query Instructors and Studio Owner
  const teachers = await prisma.user.findMany({
    where: {
      role: { in: [Role.INSTRUCTOR, Role.ADMIN] },
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bio: true,
      specialty: true,
      yearsDancing: true,
      role: true,
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-background to-orange-500/[0.05] p-6 sm:p-12 shadow-sm text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-600" />
          <span>Salsa Explosion UK • Directed by Enrique Perez Valdes (Cuba)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Bournemouth&apos;s Cuban Rhythm.{" "}
          <span className="text-amber-700 dark:text-amber-400">Authentic Cuban Soul.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
          Salsa Explosion is the UK&apos;s premier Cuban dance academy and promoter, based in Bournemouth, Dorset. Founded by Cuban maestro Enrique Perez Valdes, we have introduced thousands of dancers to the joy of authentic Casino, dynamic Rueda de Casino, Timba, and Afro-Cuban rhythms for over 25 years.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            asChild
            className="bg-amber-500 text-zinc-950 font-extrabold hover:bg-amber-400 text-sm shadow-md"
          >
            <Link href="/dashboard/schedule">
              <span>View Class Schedule</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild className="text-sm font-semibold">
            <Link href="/pricing">Get a Class Pass</Link>
          </Button>
        </div>
      </section>

      {/* 2. The 3 Core Pillars of Salsa Explosion */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Our Dance Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Why Cuban Salsa is Different
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border shadow-xs">
            <CardHeader className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold">
                The Rueda Circle • No Partner Needed
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                In Cuban Salsa, we dance in <em>La Rueda</em>—a dynamic rotating circle where turns are called out by the <em>cantante</em>. Partners switch dynamically, so everyone dances with everyone and no one ever sits out alone.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Award className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold">
                Structured 4-Tier Casino Curriculum
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                From your first <em>Guapea</em> in Beginner to complex <em>Setenta</em> combinations and Contratiempo musicality in Advanced, our clear syllabus ensures you progress smoothly without feeling overwhelmed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-300">
                <Video className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold">
                End-of-Class Video Recaps & AI Co-Pilot
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Never lose a routine in your camera roll! After every class, teachers publish a 60-second video recap of the combinations taught. Review footwork in 0.75x slow-mo anytime in your personal Recaps Vault.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 3. Meet the Maestros & Instructors */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Meet Our Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Havana-Trained Maestras & Maestros
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Passionate, patient educators dedicated to authentic Cuban styling, musicality, and encouraging every student.
            </p>
          </div>

          <Badge variant="outline" className="text-xs font-bold px-3 py-1 shrink-0">
            {teachers.length} Certified Instructors
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="border shadow-sm flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="flex items-start gap-4">
                  <TeacherAvatar
                    name={`${teacher.firstName} ${teacher.lastName}`}
                    avatarUrl={teacher.avatarUrl}
                    size="xl"
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold truncate">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                      {teacher.role === Role.ADMIN ? "Studio Founder & Maestro" : "Senior Maestra"}
                    </p>
                    {teacher.yearsDancing && (
                      <span className="text-[11px] text-muted-foreground">
                        {teacher.yearsDancing}+ Years Dancing & Teaching
                      </span>
                    )}
                  </div>
                </div>

                {teacher.specialty && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Specialty: {teacher.specialty}
                    </span>
                  </div>
                )}

                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  {teacher.bio ??
                    "Dedicated Cuban Salsa educator passionate about sharing the vibrant rhythm, partner connection, and social joy of Cuban Casino and Rueda."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold">
                  <Link href="/dashboard/schedule">
                    <span>Dance with {teacher.firstName}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Interactive Class Photo & Video Galleries */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Studio Energy & Community
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Class & Event Photo Galleries
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A glimpse into our weekly classes, high-energy Rueda circles, and weekend guest masterclasses. Click any photo to expand.
          </p>
        </div>

        {/* Gallery Component */}
        <StudioGallery />
      </section>

      {/* 5. Studio Location, Facilities & Amenities */}
      <section className="rounded-3xl border bg-card p-6 sm:p-10 shadow-sm space-y-6">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Our Havana Sanctuary
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Engineered for Social Dancing
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Dancing salsa properly requires the right space. We designed our studio from the floor up to support fast turns, circular Rueda movement, and vibrant acoustic energy.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sprung Oak Hardwood Floor:</strong> Absorbs impact and protects knees and ankles during intensive turns and footwork.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Wall Mirrors:</strong> Dual studio spaces with panoramic mirrors for body isolations and frame refinement.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cuban Timba Acoustic Sound:</strong> High-fidelity sound system calibrated for rich brass, percussion, and clave clarity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Havana Lounge & Cafe:</strong> Relax before or after class with authentic Cuban espresso, refreshing drinks, and community chatter.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <Card className="border shadow-xs">
              <CardHeader className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-base font-bold">Studio Location & Hours</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Convenient central location with seamless underground and bus connections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
                  <span className="font-bold">Main Academy Studio & Congress Venues:</span>
                  <p className="text-foreground font-semibold">
                    BOH Studios, Bournemouth, Dorset, UK
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Festival & Congress Gala Venue: The Roundhouse Hotel, Meyrick Road, Bournemouth BH1 2PR
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Weekly Class Hours:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                    <div>
                      <strong>Tuesday Classes:</strong> 19:30 – 22:30
                    </div>
                    <div>
                      <strong>Thursday Classes:</strong> 19:30 – 22:30
                    </div>
                    <div>
                      <strong>Monthly Social Fiesta:</strong> 20:00 – 01:00
                    </div>
                    <div>
                      <strong>Weekend Congresses:</strong> Annual Summer Festival
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 p-8 sm:p-12 text-white text-center shadow-lg space-y-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Step Into the Circle?
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-amber-50 leading-relaxed">
          Book your first Cuban Salsa class with Enrique Perez Valdes and the Salsa Explosion team in Bournemouth. Zero experience necessary. We guarantee you&apos;ll be smiling and dancing in your very first hour!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            asChild
            className="bg-zinc-950 text-white font-extrabold hover:bg-zinc-900 text-sm shadow-md"
          >
            <Link href="/dashboard/schedule">Explore Class Schedule</Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-zinc-950 font-bold text-sm bg-white hover:bg-zinc-100"
          >
            <Link href="/pricing">View Class Passes</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
