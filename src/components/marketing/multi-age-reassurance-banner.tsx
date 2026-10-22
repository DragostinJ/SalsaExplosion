import { Zap, HeartHandshake, Phone, MapPin, CreditCard, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Fast-Track Arrival (Busy 35–55 Professionals who want instant clarity) */}
        {(variant === "all" || variant === "fast-track-only") && (
          <div className="rounded-2xl border-2 border-primary-base/20 bg-card p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <Badge className="bg-primary-base text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
                <Zap className="h-3.5 w-3.5 fill-current" />
                15-Second Quick Guide
              </Badge>
              <span className="text-xs font-bold text-muted-foreground">
                No Partner Required
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                Joining Us Tonight? Quick Arrival Essentials
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                Book online in 15 seconds or simply pay on arrival at the studio desk.
              </p>
            </div>

            <div className="grid gap-2 text-xs font-medium pt-1">
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong className="font-extrabold">Door Pricing:</strong> £7 single class • £10 for both classes & social dancing (Card or Cash).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong className="font-extrabold">Venues & Parking:</strong> BOH Studios (BH2 5LR) • Neptune Hall (BH5 1BN, code 59200) • Woodlands Poole (BH14 9AG).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong className="font-extrabold">What to Wear:</strong> Casual comfortable clothes & smooth-soled shoes or trainers.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Senior & Non-Digital Friendly Reassurance (60+ Dancers & Casual Guests) */}
        {(variant === "all" || variant === "senior-only") && (
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <Badge className="bg-amber-800 dark:bg-amber-700 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
                <HeartHandshake className="h-3.5 w-3.5" />
                Everyone Welcome
              </Badge>
              <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                Ages 18 to 80+
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                Prefer Not to Use Apps or QR Codes?
              </h3>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed mt-0.5">
                You never need a smartphone or app to dance with Salsa Explosion!
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-background/80 p-3 text-xs text-foreground font-medium space-y-2">
              <p className="leading-relaxed">
                If you book online, our door staff can simply look you up by <strong className="font-extrabold text-foreground">your name</strong> on the door sheet. Or turn up and pay cash or card at the desk.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                <span className="text-muted-foreground font-semibold">Need advice or have questions?</span>
                <a
                  href="tel:+447969633701"
                  className="inline-flex items-center gap-1 font-black text-amber-900 dark:text-amber-300 hover:underline"
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
