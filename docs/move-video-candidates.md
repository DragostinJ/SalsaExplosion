# YouTube Video Candidates & Integration Standards

> [!IMPORTANT]
> **Strict YouTube Platform Rules & Terms of Service**
> All move video integrations in RitmoFlow must strictly adhere to YouTube's developer terms:
> 1. **Official Embedded Player Only:** Render videos solely via the official YouTube IFrame Player API.
> 2. **Start and End Timing Permitted:** You may configure `startSeconds` and `endSeconds` player parameters to cue the exact demonstration moment.
> 3. **No Downloading or Re-Hosting:** Video files must never be scraped, downloaded, transcoded, or re-hosted.
> 4. **No Obscuring or Shrinking:** Never place UI overlays over active video controls, and maintain player dimensions at or above 200×200 px.
> 5. **Creator Attribution:** Always credit the source channel title and link directly to the original video.
> 6. **Zero Paywalls on Third-Party Content:** Third-party tutorials may never be placed behind paywalls or premium tiers.
> 7. **Direct Permission:** Reach out to Cuban salsa dance creators and channels for explicit collaboration wherever possible.

---

## YouTube Data API v3 Quota Economics
- `search.list` query: **100 units** per call.
- `videos.list` query: **1 unit** per call.
- Default developer quota: **10,000 units / day** (approx. 90-95 search queries per day).
- Recommendation: Query moves in batches or on-demand rather than running bulk automated sweeps daily.

---

## Move Video Candidates Table
A human instructor or curator must review candidates, select the cleanest demonstration, determine precise `startSeconds` and `endSeconds`, and verify embeddability before committing to move data.

