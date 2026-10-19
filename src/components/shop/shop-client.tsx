"use client";

import { useState } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Shirt,
  Wind,
  Footprints,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reserveMerchItemAction } from "@/actions/shop.actions";

interface ShopItem {
  id: string;
  name: string;
  category: "APPAREL" | "ACCESSORY" | "FOOTWEAR";
  pricePounds: number;
  description: string;
  features: string[];
  sizes?: string[];
  gradient: string;
  badge: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "hoodie",
    name: "Salsa Explosion Official Zip Hoodie",
    category: "APPAREL",
    pricePounds: 40,
    description: "Premium heavy-weight fleece hoodie featuring embroidered Salsa Explosion UK Cuban crest on chest and Havana Clave print on back.",
    features: [
      "80% organic cotton, 20% recycled poly",
      "Reinforced zipper & fleece-lined hood",
      "Perfect warm-up gear before BOH Studios classes",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    badge: "Bestseller",
  },
  {
    id: "tshirt",
    name: "Bournemouth Summer Congress 2026 Festival Tee",
    category: "APPAREL",
    pricePounds: 20,
    description: "Commemorative 2026 Bournemouth Cuban Congress festival t-shirt featuring guest artist lineup and vibrant Havana artwork.",
    features: [
      "100% breathable ringspun cotton",
      "Screen-printed in Dorset, UK",
      "Pre-shrunk for durability through social washes",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gradient: "from-orange-600 via-amber-700 to-yellow-600",
    badge: "Official Congress Merch",
  },
  {
    id: "abanico",
    name: "Hand-Crafted Cuban Flag Abanico (Dance Fan)",
    category: "ACCESSORY",
    pricePounds: 12,
    description: "Essential for surviving high-energy Friday social nights and hot congress workshops. Heavy-duty wooden ribs with authentic Cuban flag silk.",
    features: [
      "Durable bamboo frame with silk fabric",
      "Snap-open sound for dramatic dance accents",
      "Fits perfectly in clutch or back pocket",
    ],
    gradient: "from-rose-600 via-blue-700 to-amber-700",
    badge: "Social Floor Essential",
  },
  {
    id: "shoes",
    name: "Cuban Casino Suede-Sole Practice Dance Shoes",
    category: "FOOTWEAR",
    pricePounds: 55,
    description: "Specially calibrated suede-soled practice sneakers for Canadian maple sprung floors. Provides effortless pivot spinning without slipping.",
    features: [
      "Genuine split suede chrome sole",
      "Shock-absorbing cushioned heel padding",
      "Protects knees & ankles during fast Rueda turns",
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    gradient: "from-slate-800 via-zinc-700 to-amber-900",
    badge: "Pro Dancer Choice",
  },
];

export function ShopClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeReservation, setActiveReservation] = useState<ShopItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isReserved, setIsReserved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredItems = SHOP_ITEMS.filter((item) =>
    selectedCategory === "ALL" ? true : item.category === selectedCategory
  );

  const handleOpenReservation = (item: ShopItem) => {
    setActiveReservation(item);
    setSelectedSize(item.sizes ? item.sizes[0] : "");
    setIsReserved(false);
    setErrorMessage(null);
  };

  const handleConfirmReservation = async () => {
    if (!activeReservation) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await reserveMerchItemAction({
        itemId: activeReservation.id,
        itemName: activeReservation.name,
        size: selectedSize || null,
        pricePounds: activeReservation.pricePounds,
      });
      if (res.success) {
        setIsReserved(true);
      } else {
        const errText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Failed to reserve item.";
        setErrorMessage(errText);
      }
    } catch {
      setErrorMessage("Network error processing reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Click and Collect Info Strip */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-foreground">
            BOH Studios Desk Collection: Reserved online, collected & fitted at Tuesday or Thursday classes.
          </span>
        </div>
        <Badge variant="outline" className="text-amber-800 dark:text-amber-300 font-bold border-amber-500/30">
          Zero Delivery Fees • Cash or Card on Collection
        </Badge>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === "ALL"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All Merch ({SHOP_ITEMS.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("APPAREL")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === "APPAREL"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Apparel & Hoodies
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("ACCESSORY")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === "ACCESSORY"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Fans & Accessories
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("FOOTWEAR")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCategory === "FOOTWEAR"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Dance Shoes
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="rounded-2xl border bg-card shadow-xs overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all"
          >
            <div>
              {/* Product Visual Banner */}
              <div
                className={`relative h-44 w-full bg-gradient-to-br ${item.gradient} p-4 flex flex-col justify-between text-white`}
              >
                <div className="flex items-center justify-between">
                  <Badge className="bg-black/40 text-white text-[10px] font-bold border-none backdrop-blur-md">
                    {item.badge}
                  </Badge>
                  <span className="font-extrabold text-lg bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-md">
                    £{item.pricePounds}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  {item.category === "APPAREL" ? (
                    <Shirt className="h-14 w-14 text-white/80" />
                  ) : item.category === "FOOTWEAR" ? (
                    <Footprints className="h-14 w-14 text-white/80" />
                  ) : (
                    <Wind className="h-14 w-14 text-white/80" />
                  )}
                </div>

                <div className="text-[10px] font-semibold text-white/80 text-right">
                  Salsa Explosion UK
                </div>
              </div>

              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <ul className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>

            <div className="p-5 pt-0 border-t mt-2">
              <Button
                type="button"
                onClick={() => handleOpenReservation(item)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                Reserve for Collection
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reservation Dialog Modal */}
      {activeReservation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveReservation(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px] mb-1">
                  Click & Collect Desk
                </Badge>
                <h3 className="text-base font-extrabold text-foreground">
                  {activeReservation.name}
                </h3>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-extrabold">
                  £{activeReservation.pricePounds}.00
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReservation(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isReserved ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">
                  Item Reserved for Collection!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your {activeReservation.name} {selectedSize ? `(Size: ${selectedSize})` : ""} is held at the BOH Studios welcome desk. Simply give your name to Maestro Enrique or desk staff at your next class session.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveReservation(null)}
                  className="bg-amber-600 text-white font-bold text-xs"
                >
                  Close & Continue Browsing
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {activeReservation.sizes && (
                  <div className="space-y-2">
                    <label className="font-bold text-foreground">Select Size / Fit:</label>
                    <div className="flex flex-wrap gap-2">
                      {activeReservation.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                            selectedSize === s
                              ? "bg-amber-600 text-white shadow-xs"
                              : "border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5">
                  <span className="font-bold text-foreground">Collection Details:</span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Location: BOH Studios, 11-15 Haviland Road West, Boscombe BH5 1DD. Pay on collection via contactless card or cash. Sizing can be exchanged at the desk if needed.
                  </p>
                </div>

                {errorMessage && (
                  <p className="text-right text-[11px] font-semibold text-destructive">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setActiveReservation(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleConfirmReservation}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    {isSubmitting ? "Holding Item..." : "Confirm Desk Reservation"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
