import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook]: Missing CLERK_WEBHOOK_SECRET environment variable.");
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix signature headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
    }) as unknown as WebhookEvent;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Clerk Webhook]: Verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json({ error: "Missing email address in payload" }, { status: 400 });
      }

      const assignedRole = (public_metadata?.role as Role) || Role.STUDENT;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
          role: assignedRole,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
          role: assignedRole,
        },
      });
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;
      const assignedRole = public_metadata?.role as Role | undefined;

      await prisma.user.updateMany({
        where: { clerkId: id },
        data: {
          ...(primaryEmail ? { email: primaryEmail } : {}),
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
          ...(assignedRole ? { role: assignedRole } : {}),
        },
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (dbError) {
    console.error(`[Clerk Webhook Error on ${eventType}]:`, dbError);
    return NextResponse.json(
      { error: "Database operation failed" },
      { status: 500 }
    );
  }
}
