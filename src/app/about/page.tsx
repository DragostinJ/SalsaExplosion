import Link from "next/link";
import {
  Flame,
  Users,
  Award,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Music,
  ExternalLink,
  Calendar,
  Ticket,
  Sparkles,
} from "lucide-react";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { StudioGallery } from "@/components/about/studio-gallery";
import { BackButton } from "@/components/navigation/back-button";
import { WhyCubanSection } from "@/components/home/WhyCubanSection";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { PosterBanner } from "@/components/poster/poster-art";
import { reportError } from "@/lib/monitoring";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export const metadata = {
  title: "About Enrique & the Teachers",
  description:
    "Salsa Explosion is Bournemouth's Cuban salsa school, founded by Cuban maestro Enrique Perez Valdes. Meet the teachers and the community.",
  alternates: { canonical: "/about" },
};

const CANONICAL_FACULTY = [
  {
    id: "canonical-enrique",
    email: "enrique@salsaexplosion.co.uk",
    firstName: "Enrique",
    lastName: "Perez Valdes",
    avatarUrl: MEDIA_MANIFEST.instructorProfiles.enrique,
    bio: "Founder & Artistic Director of Salsa Explosion. Born in Cuba, Enrique has been promoting authentic Cuban Salsa, Rueda de Casino, and Afro-Cuban culture across the UK for over 25 years. Awarded the Salsa UK Lifetime Achievement Award and voted UK's Most Popular Salsa Promoter.",
    specialty: "Cuban Salsa, Rueda de Casino, Timba & Afro-Cuban",
    yearsDancing: 28,
    role: Role.ADMIN,
  },
];

const FACULTY_PROFILE_MAP: Record<string, string> = {
  "enrique@salsaexplosion.co.uk": MEDIA_MANIFEST.instructorProfiles.enrique,
  "moe@salsaexplosion.co.uk": MEDIA_MANIFEST.instructorProfiles["moe-flex"],
  "justyna@salsaexplosion.co.uk": MEDIA_MANIFEST.instructorProfiles.justyna,
  "arturas@salsaexplosion.co.uk": MEDIA_MANIFEST.instructorProfiles.arturas,
  "jim@salsaexplosion.co.uk": MEDIA_MANIFEST.instructorProfiles.jim,
  enrique: MEDIA_MANIFEST.instructorProfiles.enrique,
  moe: MEDIA_MANIFEST.instructorProfiles["moe-flex"],
  justyna: MEDIA_MANIFEST.instructorProfiles.justyna,
  arturas: MEDIA_MANIFEST.instructorProfiles.arturas,
  jim: MEDIA_MANIFEST.instructorProfiles.jim,
};

function resolveFacultyAvatar(
  email?: string | null,
  firstName?: string | null,
  fallbackAvatar?: string | null
): string | null {
  const normalizedEmail = email?.toLowerCase().trim();
  if (normalizedEmail && FACULTY_PROFILE_MAP[normalizedEmail]) {
    return FACULTY_PROFILE_MAP[normalizedEmail];
  }
  const normalizedName = firstName?.toLowerCase().trim();
  if (normalizedName && FACULTY_PROFILE_MAP[normalizedName]) {
    return FACULTY_PROFILE_MAP[normalizedName];
  }
  return fallbackAvatar || null;
}

export default async function AboutPage() {
  let teachers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    specialty: string | null;
    yearsDancing: number | null;
    role: Role;
  }> = [];

  try {
    teachers = await prisma.user.findMany({
      where: {
        OR: [
          { role: Role.INSTRUCTOR },
          { email: "enrique@salsaexplosion.co.uk" },
        ],
        NOT: {
          email: { in: ["dragostinj@gmail.com"] },
        },
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        specialty: true,
        yearsDancing: true,
        role: true,
      },
    });
  } catch (err) {
    reportError("AboutPage:teachersQuery", err);
  }

  if (!teachers || teachers.length === 0) {
    teachers = CANONICAL_FACULTY;
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-14">
      <div>
        <BackButton fallbackUrl="/" label="Back to Homepage" />
      </div>

      {/* 1. Hero Section — Poster Architecture */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>SALSA EXPLOSION UK • FOUNDED 1994</span>
          <span className="opacity-70">DIRECTED BY ENRIQUE PEREZ VALDES (CUBA)</span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className={KICKER}>Bournemouth&apos;s Cuban Rhythm</p>
            <h1 className={`${TYPE.section} text-ink`}>
              AUTHENTIC CUBAN <span className="text-accent-red">SOUL</span>
            </h1>
            <p className="max-w-2xl text-sm font-semibold text-ink leading-relaxed">
              Salsa Explosion is the UK&apos;s premier Cuban dance academy and promoter, based in Bournemouth, Dorset. Founded by Cuban maestro Enrique Perez Valdes, we have introduced thousands of dancers to the joy of authentic Casino, dynamic Rueda de Casino, Timba, and Afro-Cuban rhythms for over 32 years.
            </p>
            <div className="inline-flex items-center gap-2 border-2 border-ink bg-poster-mustard px-3 py-1 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]">
              <Sparkles className="h-4 w-4 text-accent-red" />
              <span>Weekly Thursday &amp; Sunday Classes • £12 / £14 at the Door • BOH Studios BH2 5LR</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/classes"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold min-h-[40px] px-4 inline-flex items-center justify-center gap-1.5`}
            >
              <span>View Class Schedule</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs font-bold min-h-[40px] px-4 inline-flex items-center justify-center`}
            >
              Upcoming Festivals
            </Link>
          </div>
        </div>
      </section>

      <PosterBanner image={MEDIA_MANIFEST.editorial.bannerHavana} caption="Desde La Habana" />

      {/* 2. Core Pillars & Academy Capabilities */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <p className={`${KICKER} text-accent-red`}>
            Our Dance Philosophy &amp; Capabilities
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            Why Cuban Salsa is Different
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-teal text-ink">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              Everyone Dances
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              No partner needed and nobody is turned away when the class is uneven. The teachers rotate partners, casino and rueda style, so you dance with everyone.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-mustard text-ink">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              4-Tier Cuban Salsa Syllabus
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              From your first <em>Guapea</em> in Beginner to complex <em>Setenta</em> combinations and Contratiempo musicality in Advanced, our clear syllabus ensures you progress smoothly.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-red text-ink">
              <Ticket className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              Just Turn Up · £12 at the Door
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              No booking, no contracts, no app needed. Pay £12 for one class or £14 for two at the door, cash or card, and stay for the social. Festival passes are the only thing sold online.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-teal text-ink">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              The Rueda Circle • No Partner Needed
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              In Cuban Salsa, we dance in <em>La Rueda</em>—a dynamic rotating circle where turns are called out by the <em>cantante</em>. Partners switch dynamically, so everyone dances with everyone.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-mustard text-ink">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              Afro-Cuban &amp; Timba Heritage
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Rooted directly in Havana folklore—Batá drums, Guaguancó body isolations, Son Cubano contratiempo timing, and contemporary high-energy Timba musicality.
            </p>
          </div>

          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-poster-blue text-paper">
              <Music className="h-5 w-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
              Practise the Class Songs at Home
            </h3>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Every song from the classes is mapped section by section: the player shows what to dance now and what comes next, timed to the music. Slow it down, loop a section, learn the rueda calls.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Meet the Maestros & Instructors */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-4 border-ink pb-3">
          <div>
            <p className={`${KICKER} text-accent-red`}>
              Meet Our Faculty
            </p>
            <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card} pt-1`}>
              Havana-Trained Maestras &amp; Maestros
            </h2>
            <p className="text-xs sm:text-sm text-ink font-medium mt-1">
              Passionate, patient educators dedicated to authentic Cuban styling, musicality, and encouraging every student.
            </p>
          </div>

          <span className="border-2 border-ink bg-poster-mustard px-3 py-1 text-xs font-bold text-ink shrink-0 shadow-[2px_2px_0_0_var(--color-ink)]">
            {teachers.length} Certified Instructors
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="border-4 border-ink bg-paper text-ink shadow-[6px_6px_0_0_var(--color-ink)] flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-4">
                  <TeacherAvatar
                    name={`${teacher.firstName} ${teacher.lastName}`}
                    avatarUrl={resolveFacultyAvatar(
                      teacher.email,
                      teacher.firstName,
                      teacher.avatarUrl
                    )}
                    size="xl"
                    className="shrink-0 border-2 border-ink"
                  />
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink truncate">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-xs font-bold text-accent-red mt-0.5">
                      {teacher.email === "enrique@salsaexplosion.co.uk" || teacher.firstName === "Enrique"
                        ? "Founder & Artistic Director"
                        : "Resident Faculty Instructor"}
                    </p>
                    {teacher.yearsDancing && (
                      <span className="text-xs text-ink/70 font-semibold block mt-0.5">
                        {teacher.yearsDancing}+ Years Dancing &amp; Teaching
                      </span>
                    )}
                  </div>
                </div>

                {teacher.specialty && (
                  <div className="border border-ink bg-poster-mustard/30 px-2.5 py-1 text-xs font-bold text-ink">
                    <span>Specialty: {teacher.specialty}</span>
                  </div>
                )}

                <p className="text-xs leading-relaxed text-ink font-medium pt-1">
                  {teacher.bio ??
                    "Dedicated Cuban Salsa educator passionate about sharing the vibrant rhythm, partner connection, and social joy of Cuban Casino and Rueda."}
                </p>
              </div>

              <div className="border-t-2 border-ink bg-surface-1 p-4">
                <Link
                  href="/classes"
                  className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} w-full text-xs font-bold min-h-[40px] flex items-center justify-center gap-1.5`}
                >
                  <span>Dance with {teacher.firstName}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Class Photo & Video Galleries */}
      <section className="space-y-6">
        <div className="border-b-4 border-ink pb-3 space-y-1">
          <p className={`${KICKER} text-accent-red`}>
            Studio Energy &amp; Community
          </p>
          <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
            Class &amp; Event Photo Galleries
          </h2>
          <p className="text-xs sm:text-sm text-ink font-medium">
            A glimpse into our weekly classes, high-energy Rueda circles, and weekend guest masterclasses. Click any photo to expand.
          </p>
        </div>

        <StudioGallery />
      </section>

      {/* 5. Studio Location, Facilities & Amenities */}
      <section className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)] space-y-6">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className={`${KICKER} text-accent-red`}>
              Our Havana Sanctuary
            </p>
            <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.card}`}>
              Built for Social Dancing
            </h2>
            <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
              Dancing salsa properly requires the right space. We designed our studio from the floor up to support fast turns, circular Rueda movement, and vibrant acoustic energy.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="text-ink">Sprung Oak Hardwood Floor:</strong> Absorbs impact and protects knees and ankles during intensive turns and footwork.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="text-ink">Full Wall Mirrors:</strong> Dual studio spaces with panoramic mirrors for body isolations and frame refinement.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="text-ink">Cuban Timba Acoustic Sound:</strong> High-fidelity sound system calibrated for rich brass, percussion, and clave clarity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="text-ink">Havana Lounge &amp; Cafe:</strong> Relax before or after class with authentic Cuban espresso, refreshing drinks, and community chatter.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="border-4 border-ink bg-poster-mustard/30 p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
                <MapPin className="h-4 w-4 text-accent-red" />
                <h3 className="font-display font-black text-lg uppercase text-ink">Studio Location &amp; Hours</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="border-2 border-ink bg-paper p-3 space-y-1">
                  <span className="font-bold text-ink uppercase">Main Academy Studio &amp; Congress Venues:</span>
                  <p className="font-bold text-ink">
                    BOH Studios, Bournemouth, Dorset, UK
                  </p>
                  <p className="text-xs text-ink/75 font-medium">
                    Festival &amp; Congress Gala Venue: The Roundhouse Hotel, Meyrick Road, Bournemouth BH1 2PR
                  </p>
                </div>

                <div className="border-2 border-ink bg-paper p-3 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-ink uppercase">
                    <Clock className="h-3.5 w-3.5 text-accent-red" />
                    Weekly Class Hours:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-ink pt-1 font-medium">
                    <div>
                      <strong>Thursday Classes:</strong> 19:00 – 23:00
                    </div>
                    <div>
                      <strong>Sunday Masterclasses:</strong> 18:30 – 22:00
                    </div>
                    <div>
                      <strong>Monthly Social Fiesta:</strong> 20:00 – 01:00
                    </div>
                    <div>
                      <strong>Weekend Congresses:</strong> Annual Summer Festival
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b. Why Authentic Cuban Casino & Rueda vs Linear Styles */}
      <WhyCubanSection />

      {/* 6. Call to Action Banner */}
      <section className="border-4 border-ink bg-poster-mustard p-6 sm:p-12 text-ink text-center shadow-[8px_8px_0_0_var(--color-ink)] space-y-4">
        <h2 className={`font-display uppercase tracking-tight text-ink ${TYPE.section}`}>
          Ready to Step Into the Circle?
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-ink font-bold leading-relaxed">
          Book your first Cuban Salsa class with Enrique Perez Valdes and the Salsa Explosion team in Bournemouth. Zero experience necessary. We guarantee you&apos;ll be smiling and dancing in your very first hour!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/classes"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs sm:text-sm font-bold min-h-[44px] px-6 inline-flex items-center`}
          >
            Explore Class Schedule
          </Link>
          <Link
            href="/pricing"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper text-xs sm:text-sm font-bold min-h-[44px] px-6 inline-flex items-center`}
          >
            View Class Passes
          </Link>
        </div>

        {/* Social channels */}
        <div className="pt-4 border-t-2 border-ink flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/salsaexplosion/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-poster-pink text-ink text-xs font-bold min-h-[40px] px-3 inline-flex items-center gap-1.5`}
          >
            Follow @salsaexplosion
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://www.facebook.com/salsaexplosion"
            target="_blank"
            rel="noopener noreferrer"
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-poster-blue text-paper text-xs font-bold min-h-[40px] px-3 inline-flex items-center gap-1.5`}
          >
            Facebook Community Page
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </main>
  );
}
