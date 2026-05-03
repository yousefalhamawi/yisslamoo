import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseUrl = env.supabaseUrl;
export const supabaseAnonKey = env.supabaseAnonKey;

if (!env.isConfigured) {
  console.warn(
    "⚠️ [Security Warning]: إعدادات Supabase مفقودة أو غير صحيحة. يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY إلى ملف .env الخاص بك."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

export const checkSupabaseConfig = () => env.isConfigured;
