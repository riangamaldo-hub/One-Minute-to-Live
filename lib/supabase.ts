import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qmyylopbzozhqljuqfcl.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Q1CzzONThfz_NEL4uEXo4w_kMtGYO_L';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
