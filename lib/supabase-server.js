import { createClient } from "@supabase/supabase-js";

function cleanUrl(url) {
  if (!url) return url;
  // Remove angle brackets, quotes, whitespace, and newlines that users often paste by mistake
  return url.replace(/[<>"'\s\n\r]/g, "").trim();
}

function cleanKey(key) {
  if (!key) return key;
  return key.replace(/[\s\n\r]/g, "").trim();
}

export function getSupabaseAdmin() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !rawKey) return null;

  const url = cleanUrl(rawUrl);
  const key = cleanKey(rawKey);

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
