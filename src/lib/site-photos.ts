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
    enrique:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    justyna:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    arturas:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "moe-flex":
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    jim:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    xaris:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    anna:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    alex:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
  },
};
