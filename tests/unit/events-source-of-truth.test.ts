import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { UPCOMING_EVENTS } from "@/lib/academy-data";
import { buildSeedEventsFromCanonical } from "../../prisma/seed-data";

describe("M9: Events Single Source of Truth & Consistency", () => {
  it("ensures every canonical event has unique non-empty slug, valid dates, positive min price, and valid poster path", () => {
    const slugs = new Set<string>();

    for (const event of UPCOMING_EVENTS) {
      expect(event.slug).toBeTruthy();
      expect(slugs.has(event.slug)).toBe(false);
      slugs.add(event.slug);

      // Validate ISO start date
      const startTime = new Date(event.startDateIso).getTime();
      expect(Number.isNaN(startTime)).toBe(false);

      if (event.endDateIso) {
        const endTime = new Date(event.endDateIso).getTime();
        expect(Number.isNaN(endTime)).toBe(false);
        expect(endTime).toBeGreaterThanOrEqual(startTime);
      }

      // Positive price in pounds
      expect(event.minPricePounds).toBeGreaterThan(0);

      // Validate poster file exists on disk
      expect(event.posterUrl).toMatch(/^\//);
      const relativePublicPath = event.posterUrl.replace(/^\//, "");
      const fullPath = path.resolve(process.cwd(), "public", relativePublicPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it("builds seed event data cleanly from canonical list matching slugs, dates, and non-empty ticket tiers", () => {
    const seedEvents = buildSeedEventsFromCanonical();
    expect(seedEvents.length).toBe(UPCOMING_EVENTS.length);

    for (let i = 0; i < UPCOMING_EVENTS.length; i++) {
      const canonical = UPCOMING_EVENTS[i];
      const seeded = seedEvents[i];

      expect(seeded.slug).toBe(canonical.slug);
      expect(seeded.title).toBe(canonical.title);
      expect(seeded.description).toBe(canonical.description);
      expect(seeded.coverImageUrl).toBe(canonical.posterUrl);
      expect(seeded.startDate.toISOString()).toBe(new Date(canonical.startDateIso).toISOString());
      expect(seeded.ticketTiers.length).toBeGreaterThan(0);

      for (const tier of seeded.ticketTiers) {
        expect(tier.name).toBeTruthy();
        expect(tier.priceInCents).toBeGreaterThan(0);
        expect(tier.totalCapacity).toBeGreaterThan(0);
      }
    }
  });
});
