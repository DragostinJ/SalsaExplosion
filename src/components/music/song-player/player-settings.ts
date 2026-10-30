/** Per-device practice player settings (stored via useStoredString). */

export const PLAYER_STORAGE_KEYS = {
  role: "ritmoflow:player-role",
  latency: "ritmoflow:player-latency-offset",
  mode: "ritmoflow:player-mode",
  leadIn: "ritmoflow:player-lead-in",
  haptics: "ritmoflow:player-haptics",
} as const;

export const PRACTICE_MODES = ["learn", "dance", "quiz"] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  learn: "Learn",
  dance: "Dance",
  quiz: "Ear training",
};

export const PRACTICE_MODE_HINTS: Record<PracticeMode, string> = {
  learn: "Full detail for each section",
  dance: "Big and glanceable, phone propped up",
  quiz: "Pauses before each change: guess what's next",
};

export function parsePracticeMode(raw: string | null): PracticeMode {
  return (PRACTICE_MODES as readonly string[]).includes(raw ?? "") ? (raw as PracticeMode) : "learn";
}
