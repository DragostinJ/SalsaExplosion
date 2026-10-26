import Link from "next/link";
import {
  QrCode,
  Calendar,
  ShoppingBag,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import { PageHeader } from "@/components/layout/page-header";
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
import { PASS_PRICING_LIST, VENUE_INFO } from "@/lib/academy-data";

export const metadata = {
  title: "My Passes & Digital Wallet | Salsa Explosion Bournemouth",
  description:
    "View your studio credit balance, active Congress QR door passes, upcoming class bookings, and Click & Collect merch reservations.",
};

export default async function StudentWalletPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          title="Digital Passes &"
          titleHighlight="Studio Wallet"
          description={`Manage your Thursday & Sunday class credits, Made in Cuba festival passes, and instant 1-tap QR door check-in at ${VENUE_INFO.name} (${VENUE_INFO.address}, ${VENUE_INFO.postcode}).`}
          badge="BOH Studios Digital Wallet"
          eyebrow={`INSTANT QR DOOR ADMISSION • ${VENUE_INFO.name}`}
          backHref="/dashboard/schedule"
          backLabel="Back to Schedule"
        />

        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-10 text-ivory shadow-xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-xl"
            >
              <Link href="/sign-in">
                Sign In to Access Your Wallet
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-line bg-surface-3 hover:bg-surface-2 text-ivory font-bold text-xs sm:text-sm h-11 px-6 rounded-xl"
            >
              <Link href="/dashboard/schedule">
                Browse Thursday &amp; Sunday Timetable
              </Link>
            </Button>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
              Available Class Passes &amp; Memberships
            </h2>
            <Link
              href="/pricing"
              className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              Compare All Passes <ArrowRight className="h-3.5 w-3.5" />
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
                  <Link href="/pricing">Select Pass →</Link>
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
  let subscription = null;
  let eventRegistrations: Array<{
    id: string;
    userId: string;
    eventTicketTierId: string;
    qrCodeHash: string;
    checkedIn: boolean;
    paymentStatus: string;
    role: string;
    leadFollowRole?: string | null;
    createdAt: Date;
    event: {
      title: string;
      venueName: string;
      venueAddress: string;
      startDate: Date;
      endDate: Date;
    };
    ticketTier: {
      name: string;
    };
  }> = [];
  let upcomingBookings: Array<{
    id: string;
    danceRole: string;
    classSession: {
      id: string;
      title: string;
      startTime: Date;
      endTime: Date;
      room: string;
      instructor: {
        firstName: string | null;
        lastName: string | null;
      };
    };
  }> = [];
  let merchReservations: Array<{
    id: string;
    itemName: string;
    size: string;
    pricePounds: number;
    pickupLocation: string;
    status: string;
    createdAt: Date;
  }> = [];
  let privateLessons: Array<{
    id: string;
    instructorName: string;
    focusTopic: string;
    packageType: string;
    preferredSlot: string;
    totalPricePounds: number;
    status: string;
    createdAt: Date;
  }> = [];
  let transactions: Array<{
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    description: string;
    createdAt: Date;
  }> = [];

  let loadFailed = isFallbackUser(user);

  try {
    const [sub, reg, book, merch, priv, tx] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId: user.id },
      }),
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
      prisma.merchReservation.findMany({
        where: {
          userId: user.id,
          status: "RESERVED",
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.privateLessonBooking.findMany({
        where: {
          studentId: user.id,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.creditLedger.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    subscription = sub;
    eventRegistrations = reg as unknown as typeof eventRegistrations;
    upcomingBookings = book as unknown as typeof upcomingBookings;
    merchReservations = merch as unknown as typeof merchReservations;
    privateLessons = priv as unknown as typeof privateLessons;
    transactions = tx as unknown as typeof transactions;
  } catch (walletErr) {
    loadFailed = true;
    console.error("[StudentWalletPage:dataFetch]", walletErr);
  }

  const hasActiveSub = subscription?.status === "ACTIVE";

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {loadFailed && <DataUnavailableNotice />}
      <PageHeader
        title={user.firstName ?? "Dancer"}
        titleHighlight={user.lastName ?? "Wallet"}
        description="Show your digital passes and door QR codes at the BOH Studios Bournemouth entrance for instant 1-tap admission."
        badge={hasActiveSub ? "Unlimited Pass Active" : "BOH Studios Wallet"}
        eyebrow="DANCER DIGITAL WALLET • BOH STUDIOS"
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="rounded-xl border border-line bg-surface-2 p-3 text-center min-w-[120px] shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ivory-muted block">
                Available Credits
              </span>
              <div className="text-2xl font-black text-ivory mt-0.5">
                {user.classCredits}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-xs"
              >
                <Link href="/pricing">
                  <Coins className="mr-1.5 h-3.5 w-3.5" />
                  Top-Up Passes
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
                className="rounded-2xl border border-line bg-surface-1 p-5 shadow-xs flex flex-col justify-between space-y-4"
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
            href="/dashboard/schedule"
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            Full Timetable <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <Card className="border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
            <p>You have no upcoming class bookings booked right now.</p>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/dashboard/schedule">Browse Live Timetable</Link>
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

      {/* Merch Pickup & Private Coaching Drawer Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Merch Click & Collect Queue */}
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand" />
                <CardTitle className="text-base">
                  BOH Studios Merch Pickup ({merchReservations.length})
                </CardTitle>
              </div>
              <Link
                href="/pricing"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Gift Vouchers
              </Link>
            </div>
            <CardDescription className="text-xs">
              Pay and collect items at the studio desk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {merchReservations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">
                No active merchandise reservations.
              </p>
            ) : (
              merchReservations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-muted/20 p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-foreground">
                      {item.itemName}
                    </span>
                    <span className="text-muted-foreground text-[11px] block">
                      {item.size ? `Size ${item.size} • ` : ""}£{item.pricePounds}.00
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    Desk Pickup
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

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
      </div>

      {/* Credit Ledger History */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-bold">Recent Wallet Activity</h2>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          {transactions.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              No recent credit transactions on your account.
            </p>
          ) : (
            <div className="divide-y text-xs">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">
                      {tx.description || tx.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(tx.createdAt))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-xs ${
                        tx.amount > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      Balance: {tx.balanceAfter}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <PaymentSecurityTrustBar />
    </main>
  );
}
