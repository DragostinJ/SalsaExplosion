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
