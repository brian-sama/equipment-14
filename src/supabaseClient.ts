
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// diagnostic logging for debugging API key issues
// This will log in production to help you troubleshoot Netlify settings
console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Anon Key present:", !!supabaseAnonKey);

const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isConfigured) {
    console.error("CRITICAL: Missing Supabase environment variables!");
    console.log("Current Environment Variable Names found:", Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

// Create a client if configured, otherwise create a dummy client to prevent immediate crash
// but allow App.tsx to check configuration status
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key'); // Fallback to avoid module-level crash

export const isSupabaseConfigured = () => isConfigured;
