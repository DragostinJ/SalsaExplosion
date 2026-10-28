import { Gift, Phone, MessageSquare, CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DanceVouchersShowcaseProps {
  className?: string;
}

export function DanceVouchersShowcase({
  className = "",
}: DanceVouchersShowcaseProps) {
  const benefits = [
    "Get active and keep fit",
    "Improve coordination and confidence",
    "Learn musicality and body movement",
    "Meet new people and make friends",
    "Reduce stress and lift your mood",
    "Discover the energy and culture of Cuba",
    "Most importantly… have fun!",
  ];

  const occasions = [
    "🎂 Birthday presents",
    "🎄 Christmas presents",
    "✨ Any special occasion",
  ];

  return (
    <section
      aria-label="Dance Gift Vouchers"
      className={`relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-6 sm:p-10 shadow-lg ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ember/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Column: Authentic Copy & Value Proposition */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
                <Gift className="h-3.5 w-3.5" />
                The Perfect Gift
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground font-semibold text-xs">
                Available Now
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              DANCE VOUCHERS — THE PERFECT GIFT!
            </h2>

            <p className="text-base sm:text-lg font-medium text-muted-foreground leading-relaxed">
              Looking for a gift that’s a little different? Why not give your friends or family the gift of Cuban Salsa!
            </p>
          </div>

          {/* Occasions pills */}
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <span
                key={occ}
                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-bold text-foreground"
              >
                {occ}
              </span>
            ))}
          </div>

          <div className="rounded-2xl border bg-card/60 p-5 space-y-3">
            <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
              Cuban Salsa is more than just learning steps — it’s about music, movement, connection and having fun. It’s a brilliant way to:
            </p>

            <ul className="grid gap-2 sm:grid-cols-2 text-xs">
              {benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className={`items-center gap-2 font-semibold text-foreground/90 ${
                    idx >= 4 ? "hidden sm:flex" : "flex"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-base" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location strip */}
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>Valid across all weekly classes at:</span>
            <span className="text-foreground">BOH Studios Bournemouth (104 Commercial Rd)</span>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="tel:+447969633701"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-base px-6 py-3.5 text-sm font-black text-white shadow-md hover:bg-primary-hover transition-all min-h-11"
            >
              <Phone className="h-4 w-4" />
              ORDER NOW: 07969 633701
            </a>
            <a
              href="https://wa.me/447969633701?text=Hi%20Enrique%2C%20I%20would%20like%20to%20order%20a%20Cuban%20Salsa%20Dance%20Voucher%20please!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-black text-emerald-300 hover:bg-emerald-500/20 transition-all min-h-11"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Maestro Enrique
            </a>
          </div>
        </div>

        {/* Right Column: Physical / Digital Voucher Preview Certificate */}
        <div className="lg:col-span-5 flex justify-center">
          <Card className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface-1 text-ivory shadow-2xl relative">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between min-h-[360px]">
              <div className="flex items-start justify-between border-b border-white/20 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-200 block">
                    Official Gift Certificate
                  </span>
                  <h3 className="text-2xl font-black tracking-tight drop-shadow-sm">
                    SALSA EXPLOSION UK
                  </h3>
                  <span className="text-xs text-white/80 font-medium">
                    Bournemouth Cuban Dance Academy
                  </span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-3 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-200">
                  Presented To:
                </span>
                <p className="text-lg font-black italic tracking-wide">
                  Someone Special
                </p>
                <p className="text-xs text-white/90 leading-snug">
                  Entitles recipient to Cuban Salsa Classes & Social Dancing with Maestro Enrique Perez Valdes & Guest Artists.
                </p>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="block text-xs text-amber-200 font-bold uppercase">Locations</span>
                  <span className="font-bold">Bournemouth • Poole</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-amber-200 font-bold uppercase">Order Direct</span>
                  <span className="font-extrabold text-amber-300">07969 633701</span>
                </div>
              </div>

              <div className="text-center pt-1">
                <p className="text-xs font-bold text-amber-100 italic">
                  &ldquo;Give the gift of dance. Give the gift of Cuban Salsa!&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
