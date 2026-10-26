# Salsa Explosion Media & Video Asset Guide (M17)

This guide documents the procedures for adding new high-resolution event photography, festival posters, and curriculum recap videos into Salsa Explosion (RitmoFlow).

---

## 1. Static Image Guidelines (Posters, Venue Photos, Faculty)

### Location
Place all local static image assets inside:
```
ritmoflow/public/images/
```

### Formats & Compression
- **Preferred formats:** Modern WebP (`.webp`), AVIF (`.avif`), or high-quality compressed JPEG (`.jpg`). PNG (`.png`) should be reserved for graphics with transparent layers.
- **Budget constraints:**
  - Individual event poster assets must stay **under 350 KB** (tested automatically by `tests/unit/media-manifest.test.ts` and `npm run media:check`).
  - Hero and background images must stay under 500 KB.
  - Standard social media OpenGraph cards (`public/images/opengraph.png`): 1200x630px.

### Dimensions & Aspect Ratios
- **Event Posters / Flyers:** `3/4` aspect ratio (e.g. 1200 × 1600 px) or `4/5` (e.g. 1200 × 1500 px).
- **Hero & Panoramic Venue Photos:** `16/9` (1920 × 1080 px) or `16/10` (1920 × 1200 px).
- **Square Faculty Avatars:** `1/1` (400 × 400 px or 800 × 800 px).

---

## 2. Registering Assets in Code

### Canonical Event Catalog (`src/lib/academy-data.ts`)
When adding a new canonical event poster:
1. Copy the image into `public/images/your-poster-filename.webp`.
2. Reference the path starting with `/images/...` in `UPCOMING_EVENTS[i].posterUrl`.
3. If featuring the image in the homepage exhibition gallery, add an entry to `ACADEMY_GALLERY_PHOTOS`.

### Media Manifest (`src/lib/media-manifest.ts`)
When adding shared studio marketing posters or gateways:
1. Register the asset in `MEDIA_MANIFEST.posters` or `MEDIA_MANIFEST.gateways`.
2. Specify intrinsic `width`, `height`, `aspectRatio`, and responsive `sizes`.
3. Render using Next.js Image component with manifest props:
   ```tsx
   import Image from "next/image";
   import { MEDIA_MANIFEST } from "@/lib/media-manifest";

   <Image
     src={MEDIA_MANIFEST.posters.myNewPoster.src}
     alt={MEDIA_MANIFEST.posters.myNewPoster.alt}
     width={MEDIA_MANIFEST.posters.myNewPoster.width}
     height={MEDIA_MANIFEST.posters.myNewPoster.height}
     sizes={MEDIA_MANIFEST.posters.myNewPoster.sizes}
   />
   ```

---

## 3. Remote Image Patterns (`next.config.ts`)

The application configures Next.js `images.remotePatterns` for:
- `images.unsplash.com` (Curated Havana / Bournemouth atmosphere)
- `commondatastorage.googleapis.com` (Official audio & media assets)
- `*.supabase.co` (Supabase student storage bucket)

If hosting media on an external CDN (e.g., Cloudinary, AWS S3, or YouTube thumbnails), add the hostname under `images.remotePatterns` in `next.config.ts`.

---

## 4. Video Submissions & Curriculum Recaps

- **Storage Target:** Videos uploaded by students for level reviews or by instructors for weekly figure recaps are stored in Supabase Storage (`class-recaps` and `student-submissions` buckets).
- **Format:** MP4 (`video/mp4`) or WebM (`video/webm`) encoded with H.264 / AAC for universal iOS and Android mobile playback.
- **Max file size:** 100 MB per video clip.

---

## 5. Verification Command

Run the automated asset check at any time to verify file weights and integrity:
```bash
npm run media:check
```
