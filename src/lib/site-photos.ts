/**
 * Salsa Explosion UK - Central Photo Pipeline
 * Maps editorial photo slots to local high-resolution assets or curated Cuban culture fallbacks.
 * All photos consume the .editorial-photo duotone-to-colour CSS filter.
 */

export interface SitePhotosConfig {
  heroBackground: string;
  whyCuban: {
    rueda: string;
    musicality: string;
    community: string;
  };
  madeInCuba: string;
  instructors: {
    enrique: string;
    justyna: string;
    arturas: string;
    "moe-flex": string;
    jim: string;
    xaris: string;
    anna: string;
    alex: string;
  };
}

export const sitePhotos: SitePhotosConfig = {
  heroBackground: "/images/photos/hero-crowd.jpg",
  whyCuban: {
    rueda: "/images/photos/rueda-circle.jpg",
    musicality: "/images/photos/timba-connection.jpg",
    community: "/images/photos/social-laugh.jpg",
  },
  madeInCuba: "/images/photos/made-in-cuba-stage.jpg",
  instructors: {
    enrique: "/images/instructors/enrique.jpg",
    justyna: "/images/instructors/justyna.jpg",
    arturas: "/images/instructors/arturas.jpg",
    "moe-flex": "/images/instructors/moe-flex.jpg",
    jim: "/images/instructors/jim.jpg",
    xaris: "/images/instructors/xaris.jpg",
    anna: "/images/instructors/anna.jpg",
    alex: "/images/instructors/alex.jpg",
  },
};
