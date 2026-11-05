import Link from "next/link";
import {
  QrCode,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import { PageHeader } from "@/components/layout/page-header";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { coachingStatusTone } from "@/lib/status-tone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { reportError } from "@/lib/monitoring";
import { PASS_PRICING_LIST, VENUE_INFO } from "@/lib/academy-data";

export const metadata = {
  title: "My Passes & Digital Wallet | Salsa Explosion Bournemouth",
  description:
    "Your festival passes with their door QR codes, the classes you said you're coming to and your private lessons.",
};

export default async function StudentWalletPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          art={MEDIA_MANIFEST.mockupGraphics.phone}
          title="Digital Passes &"
          titleHighlight="Studio Wallet"
          description={`Your festival passes with their door QR codes, receipts and history. Thursday & Sunday classes are paid at the door at ${VENUE_INFO.name} (${VENUE_INFO.address}, ${VENUE_INFO.postcode}).`}
          badge="BOH Studios Digital Wallet"
          eyebrow={`INSTANT QR DOOR ADMISSION • ${VENUE_INFO.name}`}
          backHref="/dashboard/carnet"
          backLabel="Back to Mi carnet"
        />

        <div className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[6px_6px_0_var(--color-ink)] space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="border-2 border-ink bg-poster-red hover:bg-ink text-ink font-black text-xs sm:text-sm h-11 px-6 shadow-[2px_2px_0_var(--color-ink)] rounded-none"
            >
              <Link href="/sign-in">
                Sign In to Access Your Wallet
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-ink font-bold text-xs sm:text-sm h-11 px-6 shadow-[2px_2px_0_var(--color-ink)] rounded-none"
            >
              <Link href="/classes">
                Browse Thursday &amp; Sunday Timetable
              </Link>
            </Button>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
              Weekly classes: pay at the door
            </h2>
            <Link
              href="/pricing"
              className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              All prices <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PASS_PRICING_LIST.map((tier) => (
              <Card
                key={tier.id}
                className="rounded-2xl border bg-card p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                      {tier.shortLabel}
                    </span>
                    {tier.popular && (
                      <Badge className="bg-amber-500 text-black text-xs font-black">
                        Best Value
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {tier.priceDisplay}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                  <ul className="space-y-1.5 pt-2 text-xs text-foreground">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild size="sm" className="w-full font-bold text-xs">
                  <Link href="/pricing">See prices →</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <PaymentSecurityTrustBar />
      </main>
    );
  }

  // Fetch all user wallet data concurrently inside a defensive try/catch
  type WalletEventRegistration = Prisma.EventRegistrationGetPayload<{
    include: {
      event: {
        select: {
          title: true;
          venueName: true;
          venueAddress: true;
          startDate: true;
          endDate: true;
        };
      };
      ticketTier: {
        select: {
          name: true;
        };
      };
    };
  }>;

  type WalletBooking = Prisma.BookingGetPayload<{
    include: {
      classSession: {
        include: {
          instructor: {
            select: { firstName: true; lastName: true };
          };
        };
      };
    };
  }>;

  type WalletPrivateLesson = Prisma.PrivateLessonBookingGetPayload<object>;
  let eventRegistrations: WalletEventRegistration[] = [];
  let upcomingBookings: WalletBooking[] = [];
  let privateLessons: WalletPrivateLesson[] = [];

  let loadFailed = isFallbackUser(user);

  try {
    const [reg, book, priv] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: {
          userId: user.id,
          paymentStatus: "PAID",
        },
        include: {
          event: {
            select: {
              title: true,
              venueName: true,
              venueAddress: true,
              startDate: true,
              endDate: true,
            },
          },
          ticketTier: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: {
          userId: user.id,
          status: "CONFIRMED",
          classSession: {
            startTime: { gte: new Date() },
            isCancelled: false,
          },
        },
        include: {
          classSession: {
            include: {
              instructor: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: {
          classSession: { startTime: "asc" },
        },
        take: 5,
      }),
      prisma.privateLessonBooking.findMany({
        where: {
          studentId: user.id,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    eventRegistrations = reg;
    upcomingBookings = book;
    privateLessons = priv;
  } catch (walletErr) {
    loadFailed = true;
    reportError("StudentWalletPage:dataFetch", walletErr);
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {loadFailed && <DataUnavailableNotice />}
      <PageHeader
        art={MEDIA_MANIFEST.mockupGraphics.phone}
        title={user.firstName ?? "Dancer"}
        titleHighlight={user.lastName ?? "Wallet"}
        description="Show your digital passes and door QR codes at the BOH Studios Bournemouth entrance for instant 1-tap admission."
        badge="BOH Studios Wallet"
        eyebrow="DANCER DIGITAL WALLET • BOH STUDIOS"
        backHref="/dashboard/carnet"
        backLabel="Back to Mi carnet"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="border-2 border-ink bg-poster-red hover:bg-ink text-ink font-black text-xs shadow-[2px_2px_0_var(--color-ink)] rounded-none"
              >
                <Link href="/pricing">
                  <Coins className="mr-1.5 h-3.5 w-3.5" />
                  Door prices
                </Link>
              </Button>
            </div>
          </div>
        }
      />

      {/* Active Congress Passes Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <h2 className="text-lg font-bold">Your Congress & Festival Passes</h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            Explore Festivals <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {eventRegistrations.length === 0 ? (
          <Card className="border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
            <p>No festival passes registered yet.</p>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/events/made-in-cuba-dance-weekend-2026">
                Get Made in Cuba Pass
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {eventRegistrations.map((reg) => (
              <Card
                key={reg.id}
                className="border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_var(--color-ink)] flex flex-col justify-between space-y-4 rounded-none"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge className="bg-amber-600 text-white text-xs font-bold mb-1">
                        {reg.ticketTier.name}
                      </Badge>
                      <h3 className="font-bold text-sm text-foreground">
                        {reg.event.title}
                      </h3>
                    </div>
                    <StatusBadge
                      tone={reg.checkedIn ? "success" : "info"}
                      className="text-xs"
                    >
                      {reg.checkedIn ? "Checked In" : `Role: ${reg.role}`}
                    </StatusBadge>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div>
                      <strong>Venue:</strong> {reg.event.venueName}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(reg.event.startDate))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ScannableQrCode
                      value={reg.qrCodeHash}
                      size={54}
                      className="p-1 rounded-lg border-none shadow-none"
                    />
                    <div>
                      <span className="text-[11px] uppercase font-bold text-muted-foreground block">
                        Verified Door Pass Hash
                      </span>
                      <span className="font-mono text-xs font-black text-foreground">
                        {reg.qrCodeHash}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold shrink-0">
                    Door Scanner
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Confirmed Class Bookings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <h2 className="text-lg font-bold">Upcoming Confirmed Classes</h2>
          </div>
          <Link
            href="/classes"
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            Full Timetable <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <Card className="border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
            <p>You have no upcoming class bookings booked right now.</p>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/classes">Browse Live Timetable</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((b) => {
              const startFormatted = new Intl.DateTimeFormat("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(b.classSession.startTime));

              return (
                <Card
                  key={b.id}
                  className="rounded-2xl border bg-card p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          b.danceRole === "LEAD"
                            ? "bg-role-lead text-stone-950 text-xs font-bold"
                            : "bg-role-follow text-stone-950 text-xs font-bold"
                        }
                      >
                        Role: {b.danceRole}
                      </Badge>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {startFormatted}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground">
                      {b.classSession.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Room: {b.classSession.room} • Instructor:{" "}
                      {b.classSession.instructor.firstName}
                    </p>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Link href={`/checkin/${b.classSession.id}`}>
                      <QrCode className="mr-1.5 h-3.5 w-3.5" />
                      Open Door Arrival QR Pass
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Private Coaching Requests */}
      <Card className="rounded-2xl border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">
                Private Coaching ({privateLessons.length})
              </CardTitle>
            </div>
            <Link
              href="/private-lessons"
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Request Slot
            </Link>
          </div>
          <CardDescription className="text-xs">
            1-on-1 mentorship with Maestro Enrique & faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {privateLessons.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No active private lesson requests.
            </p>
          ) : (
            privateLessons.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border bg-muted/20 p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-foreground">
                    {l.instructorName}
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    {l.packageType === "SINGLE_1HR" ? "1-Hour" : "5-Hour Block"} • £
                    {l.totalPricePounds}
                  </span>
                </div>
                <StatusBadge
                  tone={coachingStatusTone(l.status)}
                  className="text-xs"
                >
                  {l.status}
                </StatusBadge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Trust bar */}
      <PaymentSecurityTrustBar />
    </main>
  );
}
