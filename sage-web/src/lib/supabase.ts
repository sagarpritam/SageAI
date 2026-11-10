import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jiawtheciauiwhcgswde.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "supabase-anon-key-not-configured";

/**
 * Client-side Supabase client for Next.js browser components.
 * Fully typed with SageAI database schema.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client for Next.js API route handlers and Server Components.
 */
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

