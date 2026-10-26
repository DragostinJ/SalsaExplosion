"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookingStatus, DanceRole } from "@prisma/client";
import {
  CheckCircle2,
  QrCode,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { selfCheckInClassQrAction } from "@/actions/management.actions";
import { bookClassAction } from "@/actions/booking.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface QrCheckInCardProps {
  session: {
    id: string;
    title: string;
    room: string;
    startTimeIso: string;
    minLevel: string;
    instructorName: string;
  };
  existingBooking: {
    id: string;
    status: BookingStatus;
    danceRole: DanceRole;
  } | null;
  preferredRole: DanceRole;
}

export function QrCheckInCard({
  session,
  existingBooking,
  preferredRole,
}: QrCheckInCardProps) {
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(
    existingBooking?.status ?? null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmCheckIn = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await selfCheckInClassQrAction({
        classSessionId: session.id,
      });

      if (res.success) {
        setBookingStatus(BookingStatus.ATTENDED);
        setFeedback({ type: "success", text: res.message });
      } else {
        setFeedback({ type: "error", text: res.error.message });
      }
    });
  };

  const handleWalkInBookAndCheckIn = (role: DanceRole) => {
    setFeedback(null);
    startTransition(async () => {
      const bookRes = await bookClassAction({
        classSessionId: session.id,
        danceRole: role,
      });

      if (!bookRes.success) {
        setFeedback({ type: "error", text: bookRes.error.message });
        return;
      }

      const checkInRes = await selfCheckInClassQrAction({
        classSessionId: session.id,
      });

      if (checkInRes.success) {
        setBookingStatus(BookingStatus.ATTENDED);
        setFeedback({
          type: "success",
          text: `Walk-in spot booked as ${role} & checked in! Enjoy class!`,
        });
      } else {
        setBookingStatus(BookingStatus.CONFIRMED);
        setFeedback({ type: "success", text: bookRes.message });
      }
    });
  };

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(session.startTimeIso));

  const isAttended = bookingStatus === BookingStatus.ATTENDED;

  return (
    <Card className="mx-auto max-w-md border-2 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 p-6 text-white text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <Badge className="bg-black/30 text-white border-none">
          Salsa Explosion Studio Door Check-In
        </Badge>
        <h1 className="text-xl font-extrabold leading-snug">{session.title}</h1>
      </div>

      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            {formattedDate}
          </span>
          <Badge variant="secondary" className="font-bold">
            {session.minLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {session.room} • Instructor: {session.instructorName}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback && (
          <div
            className={`rounded-xl border p-3.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {isAttended ? (
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/[0.06] p-6 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="text-lg font-extrabold text-emerald-300">
              You Are Checked In!
            </h2>
            <p className="text-xs text-muted-foreground">
              Show this green screen to your instructor at the studio door and step onto the dance floor.
            </p>
          </div>
        ) : bookingStatus === BookingStatus.CONFIRMED ? (
          <div className="space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              Your class reservation is confirmed. Tap below to mark your arrival at the studio.
            </p>
            <Button
              type="button"
              size="lg"
              disabled={isPending}
              onClick={handleConfirmCheckIn}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isPending ? "Checking In..." : "Confirm Studio Arrival Now"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground text-center">
              Walked in without pre-booking? Instant 1-tap booking & door check-in:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                disabled={isPending}
                onClick={() => handleWalkInBookAndCheckIn(DanceRole.LEAD)}
                variant={preferredRole === DanceRole.LEAD ? "default" : "outline"}
                className="text-xs font-bold"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Walk-In Lead
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => handleWalkInBookAndCheckIn(DanceRole.FOLLOW)}
                variant={
                  preferredRole === DanceRole.FOLLOW ? "default" : "outline"
                }
                className="text-xs font-bold"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Walk-In Follow
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between text-xs">
        <Link
          href="/dashboard/schedule"
          className="text-muted-foreground hover:text-foreground font-medium"
        >
          ← Schedule
        </Link>
        <Link
          href="/instructor/roster"
          className="text-amber-400 font-semibold flex items-center gap-1 hover:underline"
        >
          Instructor Roster
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
