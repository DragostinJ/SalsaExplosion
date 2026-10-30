import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function isSupabaseStorageConfigured(): boolean {
  const envUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (
    !envUrl ||
    envUrl.includes("[") ||
    envUrl.includes("placeholder") ||
    !serviceKey ||
    serviceKey.includes("placeholder") ||
    serviceKey.includes("...")
  ) {
    return false;
  }
  return true;
}

export function getSupabaseAdmin() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function createSignedUploadUrlHelper(
  bucket: string,
  path: string
): Promise<{
  signedUrl: string;
  token: string;
  publicUrl: string;
} | null> {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      console.warn(`[Supabase Storage Signed URL Error for ${bucket}/${path}]:`, error?.message);
      return null;
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl: publicData?.publicUrl || data.signedUrl.split("?")[0],
    };
  } catch (err) {
    console.warn(`[createSignedUploadUrlHelper Exception]:`, err);
    return null;
  }
}

export const EVENT_POSTER_BUCKET = "event-posters";
const EVENT_POSTER_MAX_BYTES = 5 * 1024 * 1024;
const EVENT_POSTER_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

/** Public URL prefix for poster objects; used to accept only our own bucket's URLs. */
export function getEventPosterPublicPrefix(): string | null {
  if (!isSupabaseStorageConfigured()) return null;
  return `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${EVENT_POSTER_BUCKET}/`;
}

let posterBucketReady = false;

async function ensureEventPosterBucket(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
): Promise<void> {
  if (posterBucketReady) return;
  const { data } = await supabaseAdmin.storage.getBucket(EVENT_POSTER_BUCKET);
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(EVENT_POSTER_BUCKET, {
      public: true,
      fileSizeLimit: EVENT_POSTER_MAX_BYTES,
      allowedMimeTypes: Object.keys(EVENT_POSTER_EXTENSIONS),
    });
    if (error && !/already exists/i.test(error.message)) {
      throw new Error(`Could not create ${EVENT_POSTER_BUCKET} bucket: ${error.message}`);
    }
  }
  posterBucketReady = true;
}

/**
 * Uploads an already magic-byte-verified poster to the public event-posters bucket.
 * Returns the public URL, or null when storage is not configured.
 */
export async function uploadEventPoster(
  eventId: string,
  bytes: Uint8Array,
  mimeType: keyof typeof EVENT_POSTER_EXTENSIONS
): Promise<string | null> {
  if (!isSupabaseStorageConfigured()) return null;
  if (bytes.length > EVENT_POSTER_MAX_BYTES) {
    throw new Error("Poster image exceeds the 5MB limit.");
  }

  const supabaseAdmin = getSupabaseAdmin();
  await ensureEventPosterBucket(supabaseAdmin);

  // Timestamped path so a re-published poster never serves a stale CDN copy
  const path = `${eventId}/${Date.now()}.${EVENT_POSTER_EXTENSIONS[mimeType]}`;
  const { error } = await supabaseAdmin.storage
    .from(EVENT_POSTER_BUCKET)
    .upload(path, bytes, { contentType: mimeType, cacheControl: "31536000", upsert: false });
  if (error) {
    throw new Error(`Poster upload failed: ${error.message}`);
  }

  return supabaseAdmin.storage.from(EVENT_POSTER_BUCKET).getPublicUrl(path).data.publicUrl;
}
