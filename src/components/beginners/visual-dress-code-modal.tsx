import {
  CheckCircle2,
  XCircle,
  Footprints,
  Shirt,
  Droplets,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface VisualDressCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualDressCodeModal({
  isOpen,
  onClose,
}: VisualDressCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Footprints className="h-3.5 w-3.5 text-amber-600" />
            <span>Studio Comfort & Floor Safety</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            What to Wear: Visual Beginner Guide
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No expensive ballroom shoes or formal Cuban guayaberas are needed for your first classes! Here is what works best on our sprung ballroom floor at BOH Studios Bournemouth.
          </p>
        </div>

        {/* 3 Categories: Shoes, Clothing, Essentials */}
        <div className="space-y-4">
          {/* Footwear Section */}
          <Card className="border-border/80 bg-background/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Footprints className="h-4 w-4 text-amber-500" />
                  <span>Footwear: Smooth Soles vs Grippy Rubber</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold">Priority #1</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-3 space-y-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> What to Bring (Recommended)
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Smooth leather-soled shoes or loafers</li>
                    <li>Suede-sole dance practice shoes</li>
                    <li>Flat canvas sneakers with worn soles (e.g. Toms, flat Vans)</li>
                    <li>Low, stable wide-heeled shoes for follows (1–2 inches)</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-3 space-y-1.5">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                    <XCircle className="h-3.5 w-3.5" /> What to Avoid
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Deep-tread running trainers (they grip and twist knees)</li>
                    <li>Metal spiked stiletto heels (damages dance floor)</li>
                    <li>Flip-flops, mules, or backless slide sandals</li>
                    <li>Heavy combat or hiking boots</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clothing & Layers */}
          <Card className="border-border/80 bg-background/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Shirt className="h-4 w-4 text-blue-500" />
                  <span>Clothing: Breathable & Layered</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold">Comfort</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-3 space-y-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ideal Outfits
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Breathable cotton T-shirts or casual button-downs</li>
                    <li>Comfortable jeans or stretchy chinos/leggings</li>
                    <li>Lightweight layer you can take off when warmed up</li>
                    <li>Free arm movement for turn patterns</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-3 space-y-1.5">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                    <XCircle className="h-3.5 w-3.5" /> Items to Skip
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Heavy wool knit sweaters (you will overheat!)</li>
                    <li>Chunky rings, watches, or sharp bracelets</li>
                    <li>Long dangling necklaces that whip during turns</li>
                    <li>Restrictive pencil skirts or tight blazers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dance Bag Essentials */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3.5 space-y-2 text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5" /> Beginner Dance Bag Checklist
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-muted-foreground">
              <div className="rounded-lg border bg-card p-2 text-center font-semibold text-foreground">
                💧 Water Bottle
              </div>
              <div className="rounded-lg border bg-card p-2 text-center font-semibold text-foreground">
                🍬 Breath Mints
              </div>
              <div className="rounded-lg border bg-card p-2 text-center font-semibold text-foreground">
                🧴 Fresh Deodorant
              </div>
              <div className="rounded-lg border bg-card p-2 text-center font-semibold text-foreground">
                🧣 Small Sweat Towel
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-6"
          >
            Got It! Ready for Class
          </Button>
        </div>
      </div>
    </div>
  );
}
