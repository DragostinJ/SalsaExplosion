import { z } from "zod";

/**
 * What to dance in a song section. Lives on its own (re-exported by timba-song-anatomy.ts) so
 * browser code such as the move schema can use it without bundling every song's timing data.
 */
export const SongDanceGearSchema = z.enum([
  "Wait / Breathe",
  "Son Cubano",
  "Casino (Smooth)",
  "Casino (Flow)",
  "Rumba Guaguancó",
  "Afro-Cuban Orishas",
  "Suelta / Shines",
  "Despelote / Reparto",
]);
export type SongDanceGear = z.infer<typeof SongDanceGearSchema>;
