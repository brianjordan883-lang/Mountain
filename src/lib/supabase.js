import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Секретный ключ (service_role / sb_secret_) обходит RLS и никогда не должен попадать в браузер.
function isSecretKey(value) {
  if (value.startsWith("sb_secret_")) return true;
  try {
    const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "service_role";
  } catch {
    return false; // не JWT (например, sb_publishable_...) — это нормально
  }
}

if (key && isSecretKey(key)) {
  throw new Error("VITE_SUPABASE_ANON_KEY содержит секретный ключ. Используйте anon / publishable key.");
}

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
