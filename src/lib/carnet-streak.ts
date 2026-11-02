const LONDON = "Europe/London";

/** Monday-based week number in Bournemouth time (1 Jan 1970 was a Thursday, hence the +3). */
function londonWeek(date: Date): number {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: LONDON }).format(date); // YYYY-MM-DD
  const days = Math.floor(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 86_400_000);
  return Math.floor((days + 3) / 7);
}

/**
 * Weeks in a row with at least one class danced, counting back from this week. A week that
 * hasn't had its class yet doesn't break the streak: it counts from last week until then.
 */
export function weeklyStreak(classDates: readonly Date[], now: Date = new Date()): number {
  const weeks = new Set(classDates.map(londonWeek));
  const thisWeek = londonWeek(now);
  let week = weeks.has(thisWeek) ? thisWeek : thisWeek - 1;
  let streak = 0;
  while (weeks.has(week)) {
    streak += 1;
    week -= 1;
  }
  return streak;
}
