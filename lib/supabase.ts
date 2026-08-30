import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qmyylopbzozhqljuqfcl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXlsb3Biem96aHFsanVxZmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTIyMDIsImV4cCI6MjEwMzYyODIwMn0.Wy0Jxe0dyC43WD-qmHad_4xHoukp2kGRKvibTz2739w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
