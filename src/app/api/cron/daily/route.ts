import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { GET as sendClassReminders } from "../class-reminders/route";
import { GET as sendOwnerDigest } from "../owner-digest/route";

/**
 * The one daily Vercel Cron (vercel.json, 09:00 UTC), so the project stays
 * within Hobby cron limits: class reminders every day, the owner digest on
 * Mondays (London time). Each job can also be called on its own.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const reminders: unknown = await (await sendClassReminders(request)).json();
  const weekday = new Date().toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
  const digest: unknown = weekday === "Monday" ? await (await sendOwnerDigest(request)).json() : "only on Mondays";
  return NextResponse.json({ reminders, digest });
}
