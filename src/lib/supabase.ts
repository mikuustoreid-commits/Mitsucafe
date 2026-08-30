// ============================================================
// SUPABASE CLIENT SETUP
// ============================================================
// This file creates the connection to the database (Supabase).
// You don't need to edit this — the connection details are
// automatically loaded from your .env file.
// ============================================================

import { createClient } from "@supabase/supabase-js";

// These read from the .env file automatically:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// This is the single database connection used everywhere in the app:
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // "Remember me" — if true, the login session survives browser restarts.
    // If false, the session is lost when the browser closes.
    persistSession: true,
    autoRefreshToken: true,
  },
});
