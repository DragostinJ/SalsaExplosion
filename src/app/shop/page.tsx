import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import {
  ShopClient,
  SerializedMerchReservation,
} from "@/components/shop/shop-client";

export const metadata = {
  title: "Official Merch & Dance Shoes | Salsa Explosion Bournemouth",
  description:
    "Official Salsa Explosion UK hoodies, 2026 Congress festival t-shirts, authentic Cuban flag hand fans, and suede-sole dance shoes with Click-and-Collect at BOH Studios.",
};

export default async function ShopPage() {
  const user = await getOrProvisionCurrentUser();

  let initialReservations: SerializedMerchReservation[] = [];
  if (user) {
    const rawReservations = await prisma.merchReservation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    initialReservations = rawReservations.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      itemName: r.itemName,
      size: r.size,
      pricePounds: r.pricePounds,
      status: r.status,
      createdAtIso: r.createdAt.toISOString(),
    }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          BOH Studios Click & Collect
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Official Merch & Dance Essentials
            </h1>
            <Badge className="bg-amber-500 text-zinc-950 font-bold">
              <ShoppingBag className="mr-1 h-3.5 w-3.5" />
              Academy Gear
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Gear up for classes and social nights! Reserve official Salsa Explosion hoodies, congress tees, Cuban fans, and Canadian-maple-calibrated dance shoes for collection at BOH Studios.
          </p>
        </div>
      </div>

      {/* Shop Storefront */}
      <ShopClient initialReservations={initialReservations} />
    </main>
  );
}
