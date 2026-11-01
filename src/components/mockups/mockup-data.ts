import { UPCOMING_EVENTS } from "@/lib/academy-data";

/**
 * Content for the three art-direction mock-ups (/mockups). Every business fact
 * comes from the canonical modules via site-content, so the mock-ups compare
 * *looks*, never different facts.
 */

export const MOCKUP_DIRECTIONS = [
  {
    slug: "icaic",
    name: "ICAIC Poster",
    summary:
      "Bold silkscreen colour, giant condensed type and cut-out shapes, after 1960s–70s Cuban film posters.",
  },
  {
    slug: "mediopunto",
    name: "Mediopunto",
    summary:
      "Havana stained-glass fans, arched photo frames and floor-tile patterns: warm, elegant and jewel-toned.",
  },
  {
    slug: "gallery",
    name: "Gallery",
    summary:
      "Today's black-and-ivory style taken further: huge serif type, museum captions, photos hung like artworks.",
  },
] as const;

export type MockupSlug = (typeof MOCKUP_DIRECTIONS)[number]["slug"];

export * from "@/lib/site-content";

/** Events that haven't finished yet (evaluated when the page is built). */
export const NEXT_EVENTS = UPCOMING_EVENTS.filter(
  (event) => Date.parse(event.endDateIso ?? event.startDateIso) >= Date.now()
);
