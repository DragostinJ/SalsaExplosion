import { Zap, HeartHandshake, Phone, MapPin, CreditCard, CheckCircle2 } from "lucide-react";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface MultiAgeReassuranceBannerProps {
  className?: string;
  variant?: "all" | "fast-track-only" | "senior-only";
}

export function MultiAgeReassuranceBanner({
  className = "",
  variant = "all",
}: MultiAgeReassuranceBannerProps) {
  return (
    <section
      data-testid="multi-age-ux-banner"
      aria-label="Class Attendance & Booking Flexibility for All Dancers"
      className={`space-y-4 ${className}`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Fast-Track Arrival (Busy 35–55 Professionals who want instant clarity) */}
        {(variant === "all" || variant === "fast-track-only") && (
          <div className="border-4 border-ink bg-paper p-5 sm:p-6 shadow-[6px_6px_0_0_var(--color-ink)] text-ink space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink pb-2.5">
              <span className="border border-ink bg-ink text-paper font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5">
                <Zap className="h-3.5 w-3.5 fill-current" />
                15-Second Quick Guide
              </span>
              <span className="text-xs font-bold text-ink/75 uppercase tracking-wider">
                No Partner Required
              </span>
            </div>

            <div>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Joining Us Tonight? Quick Arrival Essentials
              </h3>
              <p className="text-xs text-ink mt-1 font-medium leading-relaxed">
                No booking needed: just come along and pay on arrival at the studio desk.
              </p>
            </div>

            <div className="border-t-2 border-ink pt-2 space-y-2 text-xs font-medium">
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-ink">Door Pricing:</strong> £12 for 1 class • £14 for 2 classes &amp; social fiesta (Card or Cash at the Door).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent-red shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-ink">Home Hub &amp; Parking:</strong> BOH Studios Bournemouth (104 Commercial Rd, BH2 5LR) • Free on-street parking after 18:00 &amp; nearby Library Car Park.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-ink">What to Wear:</strong> Casual comfortable clothes &amp; smooth-soled shoes or trainers.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Senior & Non-Digital Friendly Reassurance (60+ Dancers & Casual Guests) */}
        {(variant === "all" || variant === "senior-only") && (
          <div className="border-4 border-ink bg-poster-mustard p-5 sm:p-6 shadow-[6px_6px_0_0_var(--color-ink)] text-ink space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b-2 border-ink pb-2.5">
              <span className="border border-ink bg-poster-red text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5">
                <HeartHandshake className="h-3.5 w-3.5" />
                Everyone Welcome
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Ages 18 to 80+
              </span>
            </div>

            <div>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Prefer Not to Use Apps or QR Codes?
              </h3>
              <p className="text-xs text-ink font-medium leading-relaxed mt-1">
                You never need a smartphone or app to dance with Salsa Explosion!
              </p>
            </div>

            <div className="border-2 border-ink bg-paper p-3.5 text-xs text-ink font-medium space-y-2">
              <p className="leading-relaxed">
                Just turn up and pay cash or card at the desk. If you told the teachers you&apos;re coming, they can find <strong className="font-bold text-ink">your name</strong> on the door sheet.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-ink">
                <span className="text-ink font-bold">Need advice or have questions?</span>
                <a
                  href="tel:+447969633701"
                  className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center gap-1`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call or text Enrique: 07969 633701
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
