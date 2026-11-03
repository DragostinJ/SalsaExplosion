import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { reportError } from "@/lib/monitoring";
import { ensureWeeklySessions } from "@/lib/schedule/ensure-weekly-sessions";
import { GET as sendClassReminders } from "../class-reminders/route";
import { GET as sendEventReminders } from "../event-reminders/route";
import { GET as sendRecapNudges } from "../recap-nudges/route";
import { GET as sendOwnerDigest } from "../owner-digest/route";

/**
 * The one daily Vercel Cron (vercel.json, 09:00 UTC), so the project stays
 * within Hobby cron limits: the next 4 weeks of Thursday and Sunday classes
 * from the timetable, class reminders every day, festival reminders two days
 * ahead, a recap nudge to teachers the morning after class, and the owner
 * digest on Mondays (London time). Each job can also be called on its own.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // First, so tonight's class exists before its reminders go out. A failure here must not stop the rest.
  let weeklyClasses: unknown;
  try {
    const result = await ensureWeeklySessions();
    if (result.created > 0) {
      revalidatePath("/classes");
      revalidatePath("/instructor/roster");
      revalidatePath("/admin/classes");
    }
    weeklyClasses = result;
  } catch (error) {
    reportError("cron:weekly-classes", error);
    weeklyClasses = { error: "failed" };
  }

  const reminders: unknown = await (await sendClassReminders(request)).json();
  const eventReminders: unknown = await (await sendEventReminders(request)).json();
  const recapNudges: unknown = await (await sendRecapNudges(request)).json();
  const weekday = new Date().toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
  const digest: unknown = weekday === "Monday" ? await (await sendOwnerDigest(request)).json() : "only on Mondays";
  return NextResponse.json({ weeklyClasses, reminders, eventReminders, recapNudges, digest });
}
