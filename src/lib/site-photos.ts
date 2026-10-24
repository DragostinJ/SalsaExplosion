/**
 * Salsa Explosion UK - Central Photo Pipeline
 * Maps editorial photo slots to verified high-resolution photography assets.
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
  instructors: Record<string, string>;
}

export const sitePhotos: SitePhotosConfig = {
  heroBackground:
    "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1600&q=80",
  whyCuban: {
    rueda:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    musicality:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    community:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80",
  },
  madeInCuba:
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
  instructors: {
    enrique: "/images/instructors/enrique.jpg",
    justyna: "/images/instructors/justyna.jpg",
    arturas: "/images/instructors/arturas.jpg",
    "moe-flex": "/images/instructors/moe-flex.jpg",
    jim: "/images/instructors/jim.jpg",
    xaris: "/images/instructors/xaris.jpg",
    anna: "/images/instructors/anna.jpg",
    alex: "/images/instructors/alex-spindlove.jpg",
    "alex-spindlove": "/images/instructors/alex-spindlove.jpg",
  },
};
