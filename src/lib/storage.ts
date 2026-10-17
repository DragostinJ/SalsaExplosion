import { createClient } from "@supabase/supabase-js";

export function isSupabaseStorageConfigured(): boolean {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
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
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl =
    envUrl && !envUrl.includes("[")
      ? envUrl
      : "https://placeholder-project.supabase.co";
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key";

  return createClient(supabaseUrl, supabaseServiceKey);
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
