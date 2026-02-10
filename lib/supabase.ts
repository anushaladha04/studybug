// Only load the URL polyfill on native platforms (not during SSR)
// Must be before other imports that might use URL
if (typeof window !== 'undefined' && typeof window.URL === 'undefined') {
    require('react-native-url-polyfill/auto');
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to your .env file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // In Expo, there is no browser URL to inspect for tokens.
        detectSessionInUrl: false,
    },
});



