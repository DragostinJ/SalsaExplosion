import { UPCOMING_EVENTS, CanonicalUpcomingEvent } from "@/lib/academy-data";
import { EventStatus } from "@prisma/client";

export interface SeedTicketTierData {
  name: string;
  description: string;
  priceInCents: number;
  totalCapacity: number;
  maxLeads?: number | null;
  maxFollows?: number | null;
  salesEndAt: Date;
}

export interface SeedEventData {
  slug: string;
  title: string;
  description: string;
  venueName: string;
  venueAddress: string;
  startDate: Date;
  endDate: Date;
  coverImageUrl: string;
  guestArtists: string[];
  status: EventStatus;
  ticketTiers: SeedTicketTierData[];
}

/**
 * Builds seed event payload derived directly from canonical UPCOMING_EVENTS.
 * Pure function: runs in Node or tests without database connection.
 */
export function buildSeedEventsFromCanonical(): SeedEventData[] {
  return UPCOMING_EVENTS.map((canonical: CanonicalUpcomingEvent): SeedEventData => {
    const startDate = new Date(canonical.startDateIso);
    const endDate = canonical.endDateIso
      ? new Date(canonical.endDateIso)
      : new Date(startDate.getTime() + 6 * 60 * 60 * 1000); // default +6h for evening party

    let guestArtists: string[] = ["Enrique Perez Valdes", "DJ Enrique"];
    let tiers: SeedTicketTierData[] = [];

    if (canonical.slug === "halloween-fancy-dress-latin-party-2026") {
      guestArtists = ["Alex Spindlove", "Anna", "Xaris", "Alex (BOH)", "Enrique Perez Valdes", "Moe Flex", "DJ Enrique"];
      tiers = [
        {
          name: "Evening Party & All Classes Pass (8PM - 2AM)",
          description:
            "8:15 PM Bachata Improvers onwards + 9:15 PM Rueda & Salsa classes + 10:00 PM SB&K Social Party until 2:00 AM + Costume competition entry.",
          priceInCents: 1500,
          totalCapacity: 120,
          maxLeads: 60,
          maxFollows: 60,
          salesEndAt: new Date("2026-10-31T19:30:00Z"),
        },
        {
          name: "SB&K Social Dance Party Only (10PM - 2AM)",
          description:
            "Admission from 10:00 PM for Salsa, Bachata & Kizomba social dancing with DJ Enrique & costume prizes.",
          priceInCents: 1000,
          totalCapacity: 150,
          salesEndAt: new Date("2026-10-31T23:00:00Z"),
        },
      ];
    } else if (canonical.slug === "sbk-night-extravaganza-nov-2026") {
      guestArtists = ["Enrique Perez Valdes", "Justyna", "Arturas", "DJ Enrique"];
      tiers = [
        {
          name: "Workshops + Party Pass (8PM - 1AM)",
          description: "Admission to 8PM Bachata & Cuban Salsa classes plus full social party.",
          priceInCents: 1200,
          totalCapacity: 100,
          maxLeads: 50,
          maxFollows: 50,
          salesEndAt: new Date("2026-11-14T19:30:00Z"),
        },
        {
          name: "Fiesta Social Pass Only (From 9:30 PM)",
          description: "Late entry for Salsa, Bachata & Kizomba dancing until 1:00 AM.",
          priceInCents: 800,
          totalCapacity: 120,
          salesEndAt: new Date("2026-11-14T22:30:00Z"),
        },
      ];
    } else if (canonical.slug === "made-in-cuba-dance-weekend-2026") {
      guestArtists = ["Enrique Perez Valdes", "Moe Flex", "Yaniel Castillo", "DJ Enrique"];
      tiers = [
        {
          name: "Full 3-Day Congress Pass (Early Bird)",
          description:
            "All workshops (Friday, Saturday & Sunday) + All Night Parties + Masterclass Certificate",
          priceInCents: 9500,
          totalCapacity: 80,
          maxLeads: 40,
          maxFollows: 40,
          salesEndAt: new Date("2026-12-04T17:00:00Z"),
        },
        {
          name: "Saturday Masterclass Bootcamp",
          description:
            "Saturday 5-hour Cuban Masterclass intensive (Casino turns, Afro-Cuban isolation & dynamic partnerwork)",
          priceInCents: 6000,
          totalCapacity: 50,
          maxLeads: 25,
          maxFollows: 25,
          salesEndAt: new Date("2026-12-04T17:00:00Z"),
        },
        {
          name: "Saturday Night Havana Fiesta Pass",
          description:
            "Entry to the Saturday Night Gala Fiesta with live Timba DJ sets, Cuban dance shows & social dancing",
          priceInCents: 2000,
          totalCapacity: 150,
          salesEndAt: new Date("2026-12-05T21:00:00Z"),
        },
      ];
    } else {
      // Default tier fallback for any canonical event
      tiers = [
        {
          name: "General Admission Pass",
          description: `${canonical.title} entry and social fiesta.`,
          priceInCents: canonical.minPricePounds * 100,
          totalCapacity: 120,
          salesEndAt: startDate,
        },
      ];
    }

    return {
      slug: canonical.slug,
      title: canonical.title,
      description: canonical.description,
      venueName: canonical.venueName,
      venueAddress: "104 Commercial Road, Bournemouth, BH2 5LR",
      startDate,
      endDate,
      coverImageUrl: canonical.posterUrl,
      guestArtists,
      status: EventStatus.PUBLISHED,
      ticketTiers: tiers,
    };
  });
}
