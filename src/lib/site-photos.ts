/**
 * Salsa Explosion UK - Central Photo Pipeline
 * Maps editorial photo slots to verified photography assets.
 * Backwards-compatible facade over MEDIA_MANIFEST (src/lib/media-manifest.ts).
 */

import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export interface SitePhotosConfig {
  heroBackground: string;
  whyCuban: {
    rueda: string;
    musicality: string;
    community: string;
  };
  madeInCuba: string;
  instructors: Record<string, string>;
}

export const sitePhotos: SitePhotosConfig = {
  heroBackground: MEDIA_MANIFEST.heroPortrait.src,
  whyCuban: {
    rueda: MEDIA_MANIFEST.whyCuban.rueda,
    musicality: MEDIA_MANIFEST.whyCuban.musicality,
    community: MEDIA_MANIFEST.whyCuban.community,
  },
  madeInCuba: MEDIA_MANIFEST.events.madeInCuba2026,
  instructors: {
    enrique: MEDIA_MANIFEST.instructors.enrique,
    justyna: MEDIA_MANIFEST.instructors.justyna,
    arturas: MEDIA_MANIFEST.instructors.arturas,
    "moe-flex": MEDIA_MANIFEST.instructors["moe-flex"],
    jim: MEDIA_MANIFEST.instructors.jim,
    xaris: MEDIA_MANIFEST.instructors.xaris,
    anna: MEDIA_MANIFEST.instructors.anna,
    alex: MEDIA_MANIFEST.instructors.alex,
    "alex-spindlove": MEDIA_MANIFEST.instructors["alex-spindlove"],
  },
};

export const SITE_PHOTOS = {
  hero: "/images/photos/hero-social.jpg",
} as const;
