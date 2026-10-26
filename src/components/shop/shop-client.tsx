"use client";

import { useState, useTransition } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Shirt,
  Wind,
  Footprints,
  Gift,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  reserveMerchItemAction,
  cancelMerchReservationAction,
} from "@/actions/shop.actions";
import { SHOP_CATALOG, CatalogShopItem } from "@/lib/constants/shop";

export interface SerializedMerchReservation {
  id: string;
  itemId: string;
  itemName: string;
  size: string | null;
  pricePounds: number;
  status: string;
  createdAtIso: string;
}

interface ShopClientProps {
  initialReservations?: SerializedMerchReservation[];
}

export function ShopClient({
  initialReservations = [],
}: ShopClientProps) {
  const shopItems = Object.values(SHOP_CATALOG);
  const [reservations, setReservations] =
    useState<SerializedMerchReservation[]>(initialReservations);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeReservation, setActiveReservation] = useState<CatalogShopItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isReserved, setIsReserved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredItems = shopItems.filter((item) =>
    selectedCategory === "ALL" ? true : item.category === selectedCategory
  );

  const handleOpenReservation = (item: CatalogShopItem) => {
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
        size: selectedSize || null,
      });
      if (res.success && res.data) {
        setIsReserved(true);
        setReservations((prev) => [
          {
            id: res.data!.reservationId,
            itemId: activeReservation.id,
            itemName: activeReservation.name,
            size: selectedSize || null,
            pricePounds: res.data!.pricePounds,
            status: "RESERVED",
            createdAtIso: new Date().toISOString(),
          },
          ...prev,
        ]);
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

  const handleCancelReservation = (reservationId: string) => {
    setCancellingId(reservationId);
    startTransition(async () => {
      const res = await cancelMerchReservationAction({ reservationId });
      if (res.success) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === reservationId ? { ...r, status: "CANCELLED" } : r
          )
        );
      }
      setCancellingId(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Existing Student Reservations Drawer */}
      {reservations.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-muted/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-600" />
              Your BOH Studios Desk Pickup Queue ({reservations.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Collect & Pay at BOH Studios Reception
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {reservations.map((res) => {
              const isReservedStatus = res.status === "RESERVED";
              const isCollected = res.status === "COLLECTED";
              const isCancelled = res.status === "CANCELLED";

              return (
                <div
                  key={res.id}
                  className="rounded-xl border bg-card p-3.5 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-foreground">
                        {res.itemName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {res.size ? `Size: ${res.size} • ` : ""}£{res.pricePounds}.00
                      </div>
                    </div>
                    <Badge
                      className={
                        isCollected
                          ? "bg-emerald-600 text-white"
                          : isReservedStatus
                          ? "bg-amber-600 text-white"
                          : isCancelled
                          ? "bg-stone-500 text-white"
                          : "bg-blue-600 text-white"
                      }
                    >
                      {res.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Pickup: BOH Studios Reception Desk</span>
                    {isReservedStatus && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === res.id}
                        onClick={() => handleCancelReservation(res.id)}
                        className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {cancellingId === res.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Click and Collect Info Strip */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-foreground">
            BOH Studios Desk Collection: Reserved online, collected & fitted at Thursday or Sunday classes.
          </span>
        </div>
        <Badge variant="outline" className="text-amber-300 font-bold border-amber-500/30">
          Zero Delivery Fees • Cash or Card on Collection
        </Badge>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
            selectedCategory === "ALL"
              ? "bg-primary-base text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All Merch ({shopItems.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("APPAREL")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
            selectedCategory === "APPAREL"
              ? "bg-primary-base text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Apparel & Hoodies
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("ACCESSORY")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
            selectedCategory === "ACCESSORY"
              ? "bg-primary-base text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Fans & Accessories
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("FOOTWEAR")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
            selectedCategory === "FOOTWEAR"
              ? "bg-primary-base text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Dance Shoes
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("VOUCHER")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
            selectedCategory === "VOUCHER"
              ? "bg-primary-base text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Gift Vouchers
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
                  ) : item.category === "VOUCHER" ? (
                    <Gift className="h-14 w-14 text-white/80" />
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

            <div className="p-5 pt-0">
              <Button
                type="button"
                onClick={() => handleOpenReservation(item)}
                className="w-full bg-primary-base hover:bg-primary-hover text-white font-bold text-xs min-h-10 shadow-xs"
              >
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                Reserve for Desk Pickup
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reservation Modal / Drawer */}
      {activeReservation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setActiveReservation(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <Badge className="bg-amber-600 text-white text-[10px] font-bold mb-1">
                  Click & Collect Reservation
                </Badge>
                <h3 className="text-base font-bold text-foreground">
                  {activeReservation.name}
                </h3>
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
              <div className="py-4 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg animate-bounce">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  Item Reserved for Desk Collection!
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your reservation for <strong>{activeReservation.name}</strong>{" "}
                  {selectedSize ? `(Size: ${selectedSize})` : ""} has been registered.
                </p>
                <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1 text-left">
                  <div>
                    <strong className="text-foreground">Price:</strong> £
                    {activeReservation.pricePounds}.00 (Pay on pickup)
                  </div>
                  <div>
                    <strong className="text-foreground">Collection Desk:</strong> BOH Studios, 104 Commercial Road, Bournemouth (BH2 5LR)
                  </div>
                  <div>
                    <strong className="text-foreground">Hours:</strong> Thursdays &amp; Sundays 18:30 – 22:30
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveReservation(null)}
                  className="w-full bg-primary-base hover:bg-primary-hover text-white font-bold text-xs"
                >
                  Close & Continue Browsing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeReservation.description}
                </p>

                {activeReservation.sizes && activeReservation.sizes.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Select Size:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {activeReservation.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                            selectedSize === size
                              ? "border-amber-600 bg-amber-600 text-white shadow-xs"
                              : "border-border bg-background hover:bg-muted text-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border bg-muted/30 p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price on Collection:</span>
                    <span className="font-extrabold text-foreground">
                      £{activeReservation.pricePounds}.00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Location:</span>
                    <span className="font-semibold text-foreground">
                      BOH Studios Reception
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="font-semibold text-foreground">
                      Card / Contactless / Cash at Desk
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-xs font-semibold text-destructive">
                    {errorMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveReservation(null)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmReservation}
                    className="flex-1 bg-primary-base hover:bg-primary-hover text-white font-bold text-xs"
                  >
                    {isSubmitting ? "Reserving..." : "Confirm Reservation"}
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
