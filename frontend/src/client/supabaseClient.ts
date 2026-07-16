import { createClient } from "@supabase/supabase-js";

const viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const viteSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(
  viteSupabaseUrl,
  viteSupabaseAnonKey
);
