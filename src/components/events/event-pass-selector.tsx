"use client";

import { useState, useTransition } from "react";
import { DanceRole } from "@prisma/client";
import {
  QrCode,
  CheckCircle2,
  Sparkles,
  Loader2,
  Ticket,
} from "lucide-react";
import { registerForEventTierAction } from "@/actions/management.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface SerializedEventTier {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceInCents: number;
  totalCapacity: number;
  maxLeads: number | null;
  maxFollows: number | null;
  bookedLeads: number;
  bookedFollows: number;
  totalBooked: number;
  userRegistration: {
    id: string;
    role: DanceRole;
    qrCodeHash: string;
    checkedIn: boolean;
  } | null;
}

interface EventPassSelectorProps {
  tiers: SerializedEventTier[];
  defaultPreferredRole: DanceRole;
}

export function EventPassSelector({
  tiers: initialTiers,
  defaultPreferredRole,
}: EventPassSelectorProps) {
  const [tiers, setTiers] = useState<SerializedEventTier[]>(initialTiers);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = (
    eventId: string,
    ticketTierId: string,
    role: DanceRole
  ) => {
    setBanner(null);
    startTransition(async () => {
      const res = await registerForEventTierAction({
        eventId,
        ticketTierId,
        role,
      });

      if (res.success) {
        setTiers((prev) =>
          prev.map((t) => {
            if (t.id !== ticketTierId) return t;
            return {
              ...t,
              totalBooked: t.totalBooked + 1,
              bookedLeads:
                role === DanceRole.LEAD ? t.bookedLeads + 1 : t.bookedLeads,
              bookedFollows:
                role === DanceRole.FOLLOW
                  ? t.bookedFollows + 1
                  : t.bookedFollows,
              userRegistration: {
                id: res.data.registrationId,
                role,
                qrCodeHash: res.data.qrCodeHash,
                checkedIn: false,
              },
            };
          })
        );
        setBanner({ type: "success", text: res.message });
      } else {
        setBanner({ type: "error", text: res.error.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
            banner.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const price = (tier.priceInCents / 100).toFixed(0);
          const isSoldOut = tier.totalBooked >= tier.totalCapacity;
          const remainingSpots = Math.max(0, tier.totalCapacity - tier.totalBooked);

          const remainingLeads =
            tier.maxLeads !== null
              ? Math.max(0, tier.maxLeads - tier.bookedLeads)
              : null;
          const remainingFollows =
            tier.maxFollows !== null
              ? Math.max(0, tier.maxFollows - tier.bookedFollows)
              : null;

          const hasRoleCap = tier.maxLeads !== null && tier.maxFollows !== null;

          return (
            <Card
              key={tier.id}
              className={`flex flex-col justify-between border shadow-sm transition-all ${
                tier.userRegistration
                  ? "border-emerald-500/50 bg-emerald-500/[0.02]"
                  : "hover:border-amber-500/50"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                  {tier.userRegistration ? (
                    <Badge className="bg-emerald-600 text-white">
                      Pass Active
                    </Badge>
                  ) : isSoldOut ? (
                    <Badge variant="destructive">Sold Out</Badge>
                  ) : (
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {remainingSpots} spots left
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    £{price}
                  </span>
                  <span className="text-xs text-muted-foreground">/ pass</span>
                </div>

                {tier.description && (
                  <CardDescription className="text-xs mt-2 line-clamp-3">
                    {tier.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {tier.userRegistration ? (
                  <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2">
                    <QrCode className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Verified Door QR Pass ({tier.userRegistration.role})
                    </div>
                    <div className="font-mono text-sm font-extrabold bg-background rounded-lg py-1.5 px-3 border inline-block">
                      {tier.userRegistration.qrCodeHash}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Show this code at the festival entrance for 1-second check-in.
                    </p>
                  </div>
                ) : (
                  hasRoleCap && (
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          Lead Spots:
                        </span>
                        <span
                          className={`font-bold ${
                            remainingLeads !== null && remainingLeads <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {remainingLeads !== null && remainingLeads > 0
                            ? `${remainingLeads} available`
                            : "Full"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          Follow Spots:
                        </span>
                        <span
                          className={`font-bold ${
                            remainingFollows !== null && remainingFollows <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : ""
                          }`}
                        >
                          {remainingFollows !== null && remainingFollows > 0
                            ? `${remainingFollows} available`
                            : "Full"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t flex flex-col gap-2">
                {tier.userRegistration ? (
                  <Button
                    variant="secondary"
                    disabled
                    className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Registered ({tier.userRegistration.qrCodeHash})
                  </Button>
                ) : hasRoleCap ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      type="button"
                      disabled={
                        isPending ||
                        isSoldOut ||
                        (remainingLeads !== null && remainingLeads <= 0)
                      }
                      onClick={() =>
                        handleRegister(tier.eventId, tier.id, DanceRole.LEAD)
                      }
                      variant={
                        defaultPreferredRole === DanceRole.LEAD
                          ? "default"
                          : "outline"
                      }
                      className="text-xs font-bold"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="mr-1.5 h-3.5 w-3.5" />
                          Book as Lead
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        isPending ||
                        isSoldOut ||
                        (remainingFollows !== null && remainingFollows <= 0)
                      }
                      onClick={() =>
                        handleRegister(tier.eventId, tier.id, DanceRole.FOLLOW)
                      }
                      variant={
                        defaultPreferredRole === DanceRole.FOLLOW
                          ? "default"
                          : "outline"
                      }
                      className="text-xs font-bold"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="mr-1.5 h-3.5 w-3.5" />
                          Book as Follow
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    disabled={isPending || isSoldOut}
                    onClick={() =>
                      handleRegister(tier.eventId, tier.id, DanceRole.SOLO)
                    }
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-semibold shadow-sm text-xs"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {isSoldOut ? "Tier Sold Out" : `Get ${tier.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
