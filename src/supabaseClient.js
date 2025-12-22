import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = 
    import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    // This will just warn in dev if env vars are missing
    console.warn(
        'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY.'
    )
}

export const supabase = createClient(supabaseUrl, supabaseKey)