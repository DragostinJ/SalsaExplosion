import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { isBootstrapAdmin } from "@/lib/auth-user";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook]: Missing CLERK_WEBHOOK_SECRET environment variable.");
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 }
    );
  }

  // Security: Reject dummy/placeholder secrets in production builds
  if (
    process.env.NODE_ENV === "production" &&
    (WEBHOOK_SECRET === "whsec_placeholder" ||
      WEBHOOK_SECRET.startsWith("whsec_placeholder") ||
      WEBHOOK_SECRET === "placeholder")
  ) {
    console.error("[Clerk Webhook]: Production cannot use placeholder CLERK_WEBHOOK_SECRET.");
    return NextResponse.json(
      { error: "Invalid webhook secret configuration in production" },
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

  // 1. Read Raw Text Body for cryptographic HMAC integrity
  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
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
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json({ error: "Missing email address in payload" }, { status: 400 });
      }

      // Security: Roles are server-controlled. Only whitelisted emails can become ADMIN.
      const initialRole = isBootstrapAdmin(primaryEmail) ? Role.ADMIN : Role.STUDENT;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
          role: initialRole,
        },
      });
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      // Security: user.updated NEVER mutates roles. Roles can only be adjusted via admin server actions.
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: {
          ...(primaryEmail ? { email: primaryEmail } : {}),
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url || null,
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
