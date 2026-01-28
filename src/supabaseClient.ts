
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnostic logging for debugging API key issues
if (import.meta.env.DEV) {
    console.log("Initializing Supabase with URL:", supabaseUrl);
    console.log("Supabase Anon Key present:", !!supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Missing Supabase environment variables! Check your .env file or Netlify settings.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
