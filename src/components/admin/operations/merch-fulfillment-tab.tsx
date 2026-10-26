"use client";

import { CheckCircle2, ShoppingBag, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { merchStatusTone } from "@/lib/status-tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MerchItem } from "./types";

interface MerchFulfillmentTabProps {
  merchReservations: MerchItem[];
  pendingMerchCount: number;
  isPending: boolean;
  onUpdateMerch: (reservationId: string, status: "COLLECTED" | "CANCELLED") => void;
}

export function MerchFulfillmentTab({
  merchReservations,
  pendingMerchCount,
  isPending,
  onUpdateMerch,
}: MerchFulfillmentTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          Merch Desk Pickup Reservations ({merchReservations.length})
        </h3>
        <span className="text-xs text-muted-foreground">
          {pendingMerchCount} awaiting studio desk collection
        </span>
      </div>

      {merchReservations.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
          <ShoppingBag className="mx-auto h-8 w-8 opacity-40 mb-2" />
          <p className="text-sm">No merchandise click-and-collect reservations yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {merchReservations.map((m) => {
            const isReserved = m.status === "RESERVED";
            return (
              <Card key={m.id} className="rounded-2xl border shadow-xs overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {m.itemName}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">
                        {m.user.firstName} {m.user.lastName} ({m.user.email})
                      </p>
                    </div>
                    <StatusBadge tone={merchStatusTone(m.status)} className="text-xs">
                      {m.status}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-3 text-xs">
                  <div className="space-y-1 text-muted-foreground">
                    {m.size && (
                      <div className="flex justify-between">
                        <span>Selected Size:</span>
                        <span className="font-semibold text-foreground uppercase">{m.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Due at Studio Desk:</span>
                      <span className="font-bold text-foreground">£{m.pricePounds}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved On:</span>
                      <span className="font-medium text-foreground">
                        {new Date(m.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>

                  {isReserved && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => onUpdateMerch(m.id, "COLLECTED")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Mark Collected & Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label="Cancel merchandise order"
                        disabled={isPending}
                        onClick={() => onUpdateMerch(m.id, "CANCELLED")}
                        className="text-rose-600 hover:text-rose-700 border-rose-800 text-[11px] h-8 px-2 font-bold"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
