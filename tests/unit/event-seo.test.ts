import { describe, it, expect } from "vitest";
import {
  buildFestivalEventJsonLd,
  buildWeeklyClassCourseJsonLd,
  EventJsonLd,
  ClassCourseJsonLd,
} from "@/lib/seo/event-jsonld";
import {
  UPCOMING_EVENTS,
  WEEKLY_SCHEDULE,
  VENUE_INFO,
} from "@/lib/academy-data";

describe("Event and Class SEO Structured Data (schema.org)", () => {
  describe("Festival and Special Event JSON-LD", () => {
    it("generates valid schema.org Event shape with correct properties", () => {
      const festival = UPCOMING_EVENTS[0];
      const eventJsonLd: EventJsonLd = buildFestivalEventJsonLd({
        slug: festival.slug,
        title: festival.title,
        description: festival.description,
        startDate: festival.startDateIso,
        endDate: festival.endDateIso,
        coverImageUrl: festival.posterUrl,
        venueName: festival.venueName,
        minPricePounds: festival.minPricePounds,
      });

      expect(eventJsonLd["@context"]).toBe("https://schema.org");
      expect(eventJsonLd["@type"]).toBe("Event");
      expect(eventJsonLd.name).toBe(festival.title);
      expect(eventJsonLd.startDate).toBe(festival.startDateIso);
      expect(eventJsonLd.endDate).toBe(festival.endDateIso);
      expect(eventJsonLd.description).toBe(festival.description);
      expect(eventJsonLd.organizer.name).toBe("Salsa Explosion UK");
      expect(eventJsonLd.organizer.url).toBe("https://salsaexplosion.co.uk");

      // Location verification
      expect(eventJsonLd.location["@type"]).toBe("Place");
      expect(eventJsonLd.location.name).toContain("BOH Studios");
      expect(eventJsonLd.location.address.streetAddress).toBe(VENUE_INFO.streetAddress);
      expect(eventJsonLd.location.address.addressLocality).toBe("Bournemouth");
      expect(eventJsonLd.location.address.postalCode).toBe("BH2 5LR");
      expect(eventJsonLd.location.address.addressCountry).toBe("GB");

      // Offer verification
      const offers = Array.isArray(eventJsonLd.offers)
        ? eventJsonLd.offers[0]
        : eventJsonLd.offers;
      expect(offers["@type"]).toBe("Offer");
      expect(offers.priceCurrency).toBe("GBP");
      expect(offers.availability).toBe("https://schema.org/InStock");
      expect(offers.url).toBe(`https://salsaexplosion.co.uk/events/${festival.slug}`);
    });

    it("supports multi-tier festival pricing in Event schema", () => {
      const eventJsonLd: EventJsonLd = buildFestivalEventJsonLd({
        slug: "made-in-cuba-2026",
        title: "Made in Cuba 2026 Dance Weekend",
        description: "Official 3-day Cuban festival.",
        startDate: "2026-12-04T18:00:00Z",
        endDate: "2026-12-06T23:00:00Z",
        venueName: VENUE_INFO.name,
        ticketTiers: [
          { name: "Full Weekend Pass", priceInCents: 12000 },
          { name: "Saturday Day Pass", priceInCents: 6500 },
        ],
      });

      expect(Array.isArray(eventJsonLd.offers)).toBe(true);
      const tiers = eventJsonLd.offers as Array<{ name?: string; price: string; priceCurrency: string }>;
      expect(tiers).toHaveLength(2);
      expect(tiers[0].name).toBe("Full Weekend Pass");
      expect(tiers[0].price).toBe("120.00");
      expect(tiers[1].name).toBe("Saturday Day Pass");
      expect(tiers[1].price).toBe("65.00");
    });
  });

  describe("Weekly Classes Pay-at-the-Door Anti-Tutorial-Hell Compliance", () => {
    it("generates Course schema with Pay at the door and ZERO purchase or Stripe URL", () => {
      const sampleSession = {
        id: "thu-salsa-foundations",
        dayName: "Thursday",
        time: "19:00",
        title: "Absolute Beginners Salsa",
        level: "Level 1",
        badge: "Beginners",
        instructor: "Enrique Perez Valdes",
      };

      const courseJsonLd: ClassCourseJsonLd = buildWeeklyClassCourseJsonLd(sampleSession);

      expect(courseJsonLd["@type"]).toBe("Course");
      expect(courseJsonLd.name).toContain("Absolute Beginners Salsa");
      expect(courseJsonLd.provider["@id"]).toBe("https://salsaexplosion.co.uk/#organization");

      // Strict door policy check
      expect(courseJsonLd.offers["@type"]).toBe("Offer");
      expect(courseJsonLd.offers.price).toBe("12.00");
      expect(courseJsonLd.offers.priceCurrency).toBe("GBP");
      expect(courseJsonLd.offers.description).toMatch(/Pay at the door/i);
      expect(courseJsonLd.offers.availability).toBe("https://schema.org/InStoreOnly");

      // Critical Rule: NO purchase or Stripe URL allowed for weekly classes
      const rawString = JSON.stringify(courseJsonLd);
      expect(rawString).not.toContain("stripe.com");
      expect(rawString).not.toContain("checkout");
      expect((courseJsonLd.offers as unknown as { url?: string }).url).toBeUndefined();
    });

    it("verifies all canonical weekly schedule sessions have no online purchase URLs", () => {
      const allSessions = [
        ...WEEKLY_SCHEDULE.thursday.sessions.map((s) => ({ ...s, dayName: "Thursday" })),
        ...WEEKLY_SCHEDULE.sunday.sessions.map((s) => ({ ...s, dayName: "Sunday" })),
      ];

      for (const session of allSessions) {
        const schema = buildWeeklyClassCourseJsonLd(session);
        const serialized = JSON.stringify(schema);
        expect(serialized).toContain("Pay at the door");
        expect(serialized).not.toContain("stripe.com");
        expect(serialized).not.toContain("checkout");
        expect((schema.offers as unknown as { url?: string }).url).toBeUndefined();
      }
    });
  });
});
