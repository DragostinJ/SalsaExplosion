import Link from "next/link";
import {
  Flame,
  MapPin,
  Calendar,
  ExternalLink,
  Award,
} from "lucide-react";
import { ACADEMY_METRICS, VENUE_INFO } from "@/lib/academy-data";

export function SiteFooter() {
  return (
    <footer className="cv-auto border-t border-line bg-surface-1 text-xs text-ivory-muted mt-auto pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Director */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold tracking-tight text-ivory transition-opacity hover:opacity-85"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-gold text-white shadow-xs">
                <Flame className="h-5 w-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black leading-none tracking-tight text-ivory">
                  Salsa <span className="text-rose-400">Explosion</span>
                </span>
                <span className="text-xs font-black text-ivory-muted uppercase tracking-widest mt-0.5">
                  Bournemouth • Cuban Salsa
                </span>
              </div>
            </Link>

            <div className="rounded-xl border border-gold/30 bg-gold/10 p-3.5 space-y-1.5 max-w-sm shadow-xs">
              <div className="flex items-center gap-1.5 text-gold font-black text-xs">
                <Award className="h-4 w-4 shrink-0 text-gold" />
                <span>{ACADEMY_METRICS.lifetimeAward}</span>
              </div>
              <p className="text-xs text-ivory-muted leading-relaxed font-medium">
                Founded &amp; directed by Cuban dance maestro <strong className="text-ivory font-black">{ACADEMY_METRICS.founderName}</strong>. Voted <strong className="text-ivory font-black">{ACADEMY_METRICS.promoterAward}</strong> with {ACADEMY_METRICS.yearsInUk} authentic UK teaching heritage.
              </p>
            </div>

            {/* Social Media Community Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={VENUE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] text-white px-3.5 py-1.5 font-extrabold shadow-md hover:shadow-lg hover:brightness-110 transition-all text-xs"
              >
                <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>{VENUE_INFO.instagramHandle}</span>
                <ExternalLink className="h-3 w-3 text-white/90" aria-hidden="true" />
              </a>

              <a
                href={VENUE_INFO.facebookUrl}
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

          {/* Col 3: Classes & Culture */}
          <div className="space-y-3">
            <h4 className="font-black text-ivory uppercase tracking-wider text-xs">
              Classes &amp; Culture
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/dashboard/schedule" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  Thursday &amp; Sunday Timetable
                </Link>
              </li>
              <li>
                <Link href="/dashboard/recaps" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  End-of-Class Recaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard/progression" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  Cuban Syllabus &amp; Level-Up
                </Link>
              </li>
              <li>
                <Link href="/dashboard/rueda" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  Rueda de Casino Dictionary
                </Link>
              </li>
              <li>
                <Link href="/music" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  Timba Song Trainer
                </Link>
              </li>
              <li>
                <Link href="/private-lessons" className="inline-flex items-center py-1 text-xs text-gold font-black hover:underline">
                  1-on-1 Private Coaching
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Festivals & Academy */}
          <div className="space-y-3">
            <h4 className="font-black text-ivory uppercase tracking-wider text-xs">
              Festivals &amp; Academy
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/events/made-in-cuba-dance-weekend-2026" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  MADE IN CUBA Weekend 2026
                </Link>
              </li>
              <li>
                <Link href="/events" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  Halloween &amp; SB&amp;K Parties
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  About Maestro Enrique
                </Link>
              </li>
              <li>
                <Link href="/venues" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-gold transition-colors">
                  BOH Studios &amp; Parking (BH2 5LR)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="inline-flex items-center py-1 text-xs text-gold font-black hover:underline">
                  Dance Gift Vouchers
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="inline-flex items-center py-1 text-xs text-ivory-muted font-bold hover:text-ivory transition-colors">
                  Student Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Locations & Hub */}
          <div className="space-y-3">
            <h4 className="font-black text-ivory uppercase tracking-wider text-xs">
              Bournemouth Studio Hub
            </h4>
            <div className="space-y-2.5 text-ivory-muted font-semibold">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span className="text-xs">
                  <strong className="text-ivory font-black">{VENUE_INFO.name}</strong>
                  <br />
                  <span className="text-ivory-muted">{VENUE_INFO.streetAddress}, {VENUE_INFO.postcode}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-ivory-muted font-medium">
                  Every Thursday &amp; Sunday at {VENUE_INFO.name} ({VENUE_INFO.streetAddress}, {VENUE_INFO.postcode}).
                </span>
              </div>
              <div className="pt-0.5 text-xs text-ivory-muted">
                <a
                  href="tel:+447969633701"
                  data-testid="footer-phone-link"
                  className="font-bold text-ivory hover:text-gold transition-colors"
                >
                  07969 633701
                </a>
              </div>
              <div className="pt-1">
                <Link
                  href="/venues"
                  className="font-black text-gold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  Venues &amp; Parking Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-line pt-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-ivory-muted">
          <p>© {new Date().getFullYear()} Salsa Explosion UK. Directed by {ACADEMY_METRICS.founderName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-gold font-bold">
              <Flame className="h-3.5 w-3.5 fill-current" />
              Salsa Explosion Dance Academy
            </span>
            <Link href="/terms" className="inline-flex items-center py-1 px-1 hover:underline text-ivory-muted font-bold">
              Terms &amp; UK Consumer Rights
            </Link>
            <Link href="/terms#refunds" className="inline-flex items-center py-1 px-1 hover:underline text-ivory-muted font-bold">
              Refund Policy
            </Link>
            <Link href="/terms#privacy" className="inline-flex items-center py-1 px-1 hover:underline text-ivory-muted font-bold">
              Privacy &amp; GDPR
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center py-1 px-1 hover:underline text-ivory-muted font-bold">
              Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
