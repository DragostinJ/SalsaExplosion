"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DanceRole } from "@prisma/client";
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  Search,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import {
  createGuestArtistEventAction,
  toggleEventRegistrationCheckInAction,
} from "@/actions/management.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AdminEventRegistrationItem {
  id: string;
  eventTitle: string;
  tierName: string;
  studentName: string;
  studentEmail: string;
  role: DanceRole;
  qrCodeHash: string;
  amountPaidInCents: number;
  checkedIn: boolean;
}

export interface AdminEventSummary {
  id: string;
  slug: string;
  title: string;
  startDateIso: string;
  venueName: string;
  guestArtists: string[];
  totalRegistrations: number;
  grossRevenuePounds: number;
}

interface EventManagerWorkspaceProps {
  initialEvents: AdminEventSummary[];
  initialRegistrations: AdminEventRegistrationItem[];
}

export function EventManagerWorkspace({
  initialEvents,
  initialRegistrations,
}: EventManagerWorkspaceProps) {
  const router = useRouter();
  const [registrations, setRegistrations] =
    useState<AdminEventRegistrationItem[]>(initialRegistrations);
  const [searchQrOrName, setSearchQrOrName] = useState("");

  // New Event Form State
  const [title, setTitle] = useState("Cuban Timba & Son Mastery Weekender");
  const [slug, setSlug] = useState("cuban-timba-son-weekender");
  const [description, setDescription] = useState(
    "2-day intensive masterclass covering authentic Son Cubano timing, Contratiempo footwork, and dynamic Casino partnerwork with international guest artists."
  );
  const [venueName, setVenueName] = useState("Gran Teatro Havana Hall");
  const [venueAddress, setVenueAddress] = useState("142 Rhythm Way, London");
  const [guestArtistsCsv, setGuestArtistsCsv] = useState(
    "Maestro Yoannis Tamayo, Maestra Indira Perez"
  );
  const [fullPassPricePounds, setFullPassPricePounds] = useState(95);
  const [fullPassCapacity, setFullPassCapacity] = useState(80);
  const [partyPassPricePounds, setPartyPassPricePounds] = useState(20);
  const [partyPassCapacity, setPartyPassCapacity] = useState(150);

  const [startDateIso, setStartDateIso] = useState(() =>
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDateIso, setEndDateIso] = useState(() =>
    new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRegistrations = useMemo(() => {
    const q = searchQrOrName.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(
      (r) =>
        r.qrCodeHash.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q)
    );
  }, [registrations, searchQrOrName]);

  const handleTogglePassCheckIn = (
    registrationId: string,
    currentlyCheckedIn: boolean
  ) => {
    const nextState = !currentlyCheckedIn;
    setBanner(null);

    startTransition(async () => {
      const res = await toggleEventRegistrationCheckInAction({
        registrationId,
        checkedIn: nextState,
      });

      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === registrationId
              ? { ...r, checkedIn: res.data.checkedIn }
              : r
          )
        );
        setBanner({ type: "success", text: res.message });
      } else {
        setBanner({ type: "error", text: res.error.message });
      }
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    startTransition(async () => {
      const res = await createGuestArtistEventAction({
        title,
        slug,
        description,
        venueName,
        venueAddress,
        startDateIso,
        endDateIso,
        guestArtistsCsv,
        fullPassPricePounds: Number(fullPassPricePounds),
        fullPassCapacity: Number(fullPassCapacity),
        partyPassPricePounds: Number(partyPassPricePounds),
        partyPassCapacity: Number(partyPassCapacity),
      });

      if (res.success) {
        setBanner({ type: "success", text: res.message });
        setSlug(`cuban-timba-weekender-${Math.floor(100 + Math.random() * 900)}`);
        router.refresh();
      } else {
        setBanner({ type: "error", text: res.error.message });
      }
    });
  };

  const totalEventRevenuePounds = useMemo(() => {
    return (
      registrations.reduce((sum, r) => sum + r.amountPaidInCents, 0) / 100
    );
  }, [registrations]);

  // Eventbrite charges ~6.5% + £0.59 per ticket vs Stripe ~1.5% + £0.20
  const estimatedEventbriteSavings = useMemo(() => {
    return (
      totalEventRevenuePounds * 0.05 + registrations.length * 0.39
    ).toFixed(2);
  }, [totalEventRevenuePounds, registrations.length]);

  return (
    <div className="space-y-8">
      {/* Financial ROI Highlight Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
              Event Pass Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">
              £{totalEventRevenuePounds.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              From {registrations.length} confirmed festival passes
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
              Saved vs. Eventbrite Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              +£{estimatedEventbriteSavings}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct Stripe payout (0% platform commission)
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
              Door Check-In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">
              {registrations.filter((r) => r.checkedIn).length} /{" "}
              {registrations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              QR passes verified at venue entrance
            </p>
          </CardContent>
        </Card>
      </div>

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

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Col (7 Cols): Door QR Pass Scanner & Attendee List */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg font-bold">
                      Festival Door QR Scanner & Pass Roster
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Scan or type a dancer&apos;s QR code (e.g., RF-PASS-SOFIA-001) to verify their pass in 1 second.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  aria-label="Scan or search QR hash or dancer name"
                  value={searchQrOrName}
                  onChange={(e) => setSearchQrOrName(e.target.value)}
                  placeholder="Scan or search QR hash (RF-PASS-...) or dancer name..."
                  className="w-full rounded-xl border bg-background pl-9 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2.5">
                {filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                      reg.checkedIn
                        ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                        : "bg-card"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-muted px-2 py-0.5 rounded border">
                          {reg.qrCodeHash}
                        </span>
                        <span className="text-sm font-bold">
                          {reg.studentName}
                        </span>
                        <Badge
                          className={
                            reg.role === DanceRole.LEAD
                              ? "bg-blue-700 text-white text-[10px]"
                              : "bg-rose-700 text-white text-[10px]"
                          }
                        >
                          {reg.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {reg.tierName} • £
                        {(reg.amountPaidInCents / 100).toFixed(0)} Paid
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      variant={reg.checkedIn ? "secondary" : "default"}
                      onClick={() =>
                        handleTogglePassCheckIn(reg.id, reg.checkedIn)
                      }
                      className={
                        reg.checkedIn
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-xs"
                          : "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      }
                    >
                      {reg.checkedIn ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Verified at Door ✓
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                          Verify & Check In
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Published Events List */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Published Guest Artist Events ({initialEvents.length})
            </h2>
            {initialEvents.map((ev) => (
              <Card key={ev.id} className="border shadow-xs">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {ev.guestArtists.join(" • ")} — {ev.totalRegistrations}{" "}
                      passes sold (£{ev.grossRevenuePounds})
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href={`/events/${ev.slug}`}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Public Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Col (5 Cols): Create New Guest Artist Event */}
        <div className="lg:col-span-5">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-bold">
                  Launch Guest Artist Event
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Create a high-ticket weekend bootcamp or festival with role-balanced Full Passes and Party Passes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold">Event Title</label>
                  <input
                    type="text"
                    aria-label="Event Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">URL Slug</label>
                  <input
                    type="text"
                    aria-label="URL Slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">
                    Guest Artists (comma-separated)
                  </label>
                  <input
                    type="text"
                    aria-label="Guest Artists"
                    required
                    value={guestArtistsCsv}
                    onChange={(e) => setGuestArtistsCsv(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold">Venue Name</label>
                    <input
                      type="text"
                      aria-label="Venue Name"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Venue Address</label>
                    <input
                      type="text"
                      aria-label="Venue Address"
                      required
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold">Start Date</label>
                    <input
                      type="date"
                      aria-label="Start Date"
                      required
                      value={startDateIso}
                      onChange={(e) => setStartDateIso(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">End Date</label>
                    <input
                      type="date"
                      aria-label="End Date"
                      required
                      value={endDateIso}
                      onChange={(e) => setEndDateIso(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold">Full Pass Price (£)</label>
                    <input
                      type="number"
                      aria-label="Full Pass Price"
                      min={10}
                      value={fullPassPricePounds}
                      onChange={(e) =>
                        setFullPassPricePounds(Number(e.target.value))
                      }
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">
                      Full Pass Cap (50/50 L/F)
                    </label>
                    <input
                      type="number"
                      aria-label="Full Pass Capacity"
                      min={10}
                      value={fullPassCapacity}
                      onChange={(e) =>
                        setFullPassCapacity(Number(e.target.value))
                      }
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold">Party Pass Price (£)</label>
                    <input
                      type="number"
                      aria-label="Party Pass Price"
                      min={5}
                      value={partyPassPricePounds}
                      onChange={(e) =>
                        setPartyPassPricePounds(Number(e.target.value))
                      }
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Party Pass Capacity</label>
                    <input
                      type="number"
                      aria-label="Party Pass Capacity"
                      min={10}
                      value={partyPassCapacity}
                      onChange={(e) =>
                        setPartyPassCapacity(Number(e.target.value))
                      }
                      className="w-full rounded-xl border bg-background px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Description</label>
                  <textarea
                    rows={3}
                    aria-label="Event Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  {isPending ? "Publishing Event..." : "Publish Guest Artist Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
