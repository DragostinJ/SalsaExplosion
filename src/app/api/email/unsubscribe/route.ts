import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { escapeHtml } from "@/lib/email/templates";
import { reportError } from "@/lib/monitoring";

/**
 * Class-reminder unsubscribe. GET shows a confirm button (mail scanners
 * pre-open links, so GET must not change anything); POST unsubscribes, which
 * also serves one-click unsubscribe (List-Unsubscribe-Post, RFC 8058).
 */

export const dynamic = "force-dynamic";

function page(message: string, form = "") {
  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Class reminders</title></head>` +
      `<body style="margin:0;background:#080706;color:#F5F2EB;font-family:Arial,Helvetica,sans-serif">` +
      `<main style="max-width:480px;margin:0 auto;padding:48px 16px"><h1 style="font-size:20px">Salsa Explosion</h1>` +
      `<p style="font-size:16px">${message}</p>${form}</main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function readParams(request: Request) {
  const url = new URL(request.url);
  return { userId: url.searchParams.get("u") ?? "", token: url.searchParams.get("t") ?? "" };
}

export async function GET(request: Request) {
  const { userId, token } = readParams(request);
  if (!verifyUnsubscribeToken(userId, token)) return page("This unsubscribe link isn't valid.");
  const action = `/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(token)}`;
  return page(
    "Stop getting class reminder emails?",
    `<form method="post" action="${escapeHtml(action)}"><button type="submit" style="min-height:44px;padding:0 20px;border:0;border-radius:12px;background:#F59E0B;color:#080706;font-weight:bold;font-size:16px">Yes, stop reminders</button></form>`
  );
}

export async function POST(request: Request) {
  const { userId, token } = readParams(request);
  if (!verifyUnsubscribeToken(userId, token)) return page("This unsubscribe link isn't valid.");
  try {
    await prisma.user.updateMany({ where: { id: userId }, data: { classRemindersOptOut: true } });
    return page("Done. You won't get class reminder emails any more.");
  } catch (error) {
    reportError("email:unsubscribe", error);
    return page("Something went wrong. Please try again in a minute.");
  }
}
