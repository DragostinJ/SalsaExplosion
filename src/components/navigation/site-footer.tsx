import Link from "next/link";
import {
  Flame,
  MapPin,
  Calendar,
  ExternalLink,
  Award,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="cv-auto border-t bg-card text-xs text-foreground mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Director */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-sm shadow-primary-base/20">
                <Flame className="h-5 w-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black leading-none tracking-tight">
                  Salsa <span className="text-rose-700 dark:text-rose-400">Explosion</span>
                </span>
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest mt-0.5">
                  Bournemouth • Cuban Salsa
                </span>
              </div>
            </Link>

            <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 p-3.5 space-y-1.5 max-w-sm shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-200 font-black text-xs">
                <Award className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                <span>UK Lifetime Achievement Award</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed font-semibold">
                Founded & directed by Cuban dance maestro <strong className="text-foreground font-black">Enrique Perez Valdes</strong>. Voted <strong className="text-foreground font-black">UK&apos;s Most Popular Salsa Promoter</strong> with 30+ years authentic heritage.
              </p>
            </div>

            {/* Social Media Community Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://www.instagram.com/salsaexplosion/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] text-white px-3.5 py-1.5 font-extrabold shadow-md hover:shadow-lg hover:brightness-110 transition-all text-xs"
              >
                <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@salsaexplosion</span>
                <ExternalLink className="h-3 w-3 text-white/90" aria-hidden="true" />
              </a>

              <a
                href="https://www.facebook.com/salsaexplosion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0866ff] hover:bg-[#0756d6] text-white px-3.5 py-1.5 font-extrabold shadow-md hover:shadow-lg transition-all text-xs"
              >
                <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                <span>Salsa Explosion Page</span>
                <ExternalLink className="h-3 w-3 text-white/90" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 3: Dancers & Classes */}
          <div className="space-y-3">
            <h4 className="font-black text-foreground uppercase tracking-wider text-xs">
              Dancers & Classes
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/dashboard/schedule" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  Weekly Class Timetable
                </Link>
              </li>
              <li>
                <Link href="/dashboard/recaps" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  End-of-Class Video Vault
                </Link>
              </li>
              <li>
                <Link href="/dashboard/progression" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  Cuban Syllabus & Level-Up
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  Drop-ins & Monthly Passes
                </Link>
              </li>
              <li>
                <Link href="/private-lessons" className="inline-flex items-center py-1 text-xs text-rose-700 dark:text-rose-400 font-black hover:underline">
                  1-on-1 Private Coaching
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Events & Festivals */}
          <div className="space-y-3">
            <h4 className="font-black text-foreground uppercase tracking-wider text-xs">
              Congresses & Socials
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/events" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  Bournemouth Cuban Congress 2026
                </Link>
              </li>
              <li>
                <Link href="/events" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  Havana Nights Social Party
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  How QR Passes Work
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center py-1 text-xs text-foreground font-bold hover:text-primary-base transition-colors">
                  About Enrique & Academy
                </Link>
              </li>
              <li>
                <Link href="/music" className="inline-flex items-center py-1 text-xs text-rose-700 dark:text-rose-400 font-black hover:underline">
                  Cuban Music & Playlists
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="inline-flex items-center py-1 text-xs text-rose-700 dark:text-rose-400 font-black hover:underline">
                  Dance Gift Vouchers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Locations & Hub */}
          <div className="space-y-3">
            <h4 className="font-black text-foreground uppercase tracking-wider text-xs">
              Bournemouth Studio Hub
            </h4>
            <div className="space-y-2.5 text-foreground font-semibold">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary-base shrink-0 mt-0.5" />
                <span className="text-xs">
                  <strong className="text-foreground font-black">BOH Studios Bournemouth</strong>
                  <br />
                  <span className="text-foreground">104 Commercial Rd, BH2 5LR</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary-base shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-foreground font-medium">
                  Tuesdays at Neptune Hall • Wednesdays at Woodlands Ballroom Poole • Thursdays & Sundays at BOH Studios.
                </span>
              </div>
              <div className="pt-0.5 text-xs text-muted-foreground">
                <a href="tel:07969633701" className="font-bold text-amber-800 dark:text-amber-300 hover:underline">
                  📞 07969 633701
                </a>
              </div>
              <div className="pt-1">
                <Link
                  href="/venues"
                  className="font-black text-rose-700 dark:text-rose-400 hover:underline inline-flex items-center gap-1 text-xs"
                >
                  Venues & Parking Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700 dark:text-slate-300">
          <p>© {new Date().getFullYear()} Salsa Explosion UK. Directed by Enrique Perez Valdes. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
              <Flame className="h-3.5 w-3.5 fill-current" />
              Salsa Explosion Dance Academy
            </span>
            <Link href="/how-it-works" className="inline-flex items-center py-1 px-1 hover:underline text-foreground font-bold">
              Guide
            </Link>
            <Link href="/about" className="inline-flex items-center py-1 px-1 hover:underline text-foreground font-bold">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
