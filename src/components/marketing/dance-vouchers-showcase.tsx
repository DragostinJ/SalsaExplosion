import Image from "next/image";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { Gift, Phone, MessageSquare, CheckCircle2, MapPin } from "lucide-react";

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
      className={`relative border-4 border-ink bg-poster-teal p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)] ${className}`}
    >
      <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Column: Authentic Copy & Value Proposition */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-2 border-ink bg-paper text-ink font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
                <Gift className="h-3.5 w-3.5 text-accent-red" />
                The Perfect Gift
              </span>
              <span className="border-2 border-ink bg-poster-mustard text-ink font-bold text-xs uppercase tracking-wider px-3 py-1">
                Available Now
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink leading-tight">
                DANCE VOUCHERS — THE PERFECT GIFT!
              </h2>
              <Image
                src={MEDIA_MANIFEST.mockupGraphics.gift.src}
                alt=""
                width={MEDIA_MANIFEST.mockupGraphics.gift.width}
                height={MEDIA_MANIFEST.mockupGraphics.gift.height}
                sizes="8rem"
                className="w-20 shrink-0 sm:w-32"
              />
            </div>

            <p className="text-sm sm:text-base font-bold text-ink leading-relaxed">
              Looking for a gift that’s a little different? Why not give your friends or family the gift of Cuban Salsa!
            </p>
          </div>

          {/* Occasions pills */}
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <span
                key={occ}
                className="inline-flex items-center border-2 border-ink bg-paper px-3 py-1 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]"
              >
                {occ}
              </span>
            ))}
          </div>

          <div className="border-2 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)]">
            <p className="text-xs sm:text-sm text-ink font-bold leading-relaxed">
              Cuban Salsa is more than just learning steps — it’s about music, movement, connection and having fun. It’s a brilliant way to:
            </p>

            <ul className="grid gap-2 sm:grid-cols-2 text-xs">
              {benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className={`items-center gap-2 font-semibold text-ink ${
                    idx >= 4 ? "hidden sm:flex" : "flex"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-red" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location strip */}
          <div className="border-2 border-ink bg-poster-mustard p-3 flex items-center gap-2 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
            <MapPin className="h-4 w-4 text-accent-red shrink-0" />
            <span>Valid across all weekly classes at BOH Studios Bournemouth (104 Commercial Rd)</span>
          </div>

          {/* Call to Actions - ICAIC Silkscreen Stamp Style */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="tel:+447969633701"
              className="border-4 border-ink bg-poster-red text-ink hover:bg-ink hover:text-ink font-display text-sm font-black uppercase tracking-wider px-6 py-3.5 shadow-[4px_4px_0_0_var(--color-ink)] min-h-[44px] flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="h-4 w-4" />
              ORDER NOW: 07969 633701
            </a>
            <a
              href="https://wa.me/447969633701?text=Hi%20Enrique%2C%20I%20would%20like%20to%20order%20a%20Cuban%20Salsa%20Dance%20Voucher%20please!"
              target="_blank"
              rel="noopener noreferrer"
              className="border-4 border-ink bg-paper text-ink hover:bg-ink hover:text-paper font-display text-sm font-black uppercase tracking-wider px-6 py-3.5 shadow-[4px_4px_0_0_var(--color-ink)] min-h-[44px] flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Maestro Enrique
            </a>
          </div>
        </div>

        {/* Right Column: Physical / Digital Voucher Preview Certificate */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md border-4 border-ink bg-paper text-ink p-6 sm:p-8 shadow-[10px_10px_0_0_var(--color-ink)] space-y-5 relative">
            <div className="border-b-4 border-dashed border-ink pb-4 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-ink/70 block">
                  Official Gift Certificate
                </span>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                  SALSA EXPLOSION UK
                </h3>
                <span className="text-xs text-ink font-semibold">
                  Bournemouth Cuban Dance Academy
                </span>
              </div>
              <div className="h-11 w-11 border-2 border-ink bg-poster-mustard flex items-center justify-center shadow-[2px_2px_0_0_var(--color-ink)]">
                <Gift className="h-6 w-6 text-ink" />
              </div>
            </div>

            <div className="space-y-2 border-2 border-ink bg-poster-mustard/20 p-4">
              <span className="text-xs uppercase font-bold tracking-wider text-ink/70 block">
                Presented To:
              </span>
              <p className="font-display font-black text-xl italic uppercase tracking-wide text-ink">
                Someone Special
              </p>
              <p className="text-xs text-ink font-medium leading-relaxed">
                Entitles recipient to Cuban Salsa Classes &amp; Social Dancing with Maestro Enrique Perez Valdes &amp; Guest Artists.
              </p>
            </div>

            <div className="border-2 border-accent-red text-accent-red p-2 font-display font-black text-center text-xs uppercase tracking-widest rotate-[-3deg]">
              OFFICIAL VOUCHER · SALSA EXPLOSION
            </div>

            <div className="pt-2 border-t-2 border-ink flex items-center justify-between text-xs font-bold">
              <div>
                <span className="block text-ink/70 uppercase">Locations</span>
                <span>Bournemouth • Poole</span>
              </div>
              <div className="text-right">
                <span className="block text-ink/70 uppercase">Order Direct</span>
                <span className="text-accent-red">07969 633701</span>
              </div>
            </div>

            <div className="text-center pt-1 border-t border-ink/20">
              <p className="text-xs font-bold text-ink italic">
                &ldquo;Give the gift of dance. Give the gift of Cuban Salsa!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
