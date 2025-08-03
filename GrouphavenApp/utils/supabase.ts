// lib/supabaseClient.ts (or wherever you define it)
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { w3cwebsocket } from 'websocket'; // ✅ THIS is crucial for React Native

const supabaseUrl = 'https://lrryxyalvumuuvefxhrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzU0MjUxNSwiZXhwIjoyMDQ5MTE4NTE1fQ.k7mN8J2B11ziQnSU8DNQbH798HijEe3wP9G3ZeYHxwI';

// ✅ Supabase client for user-side (with realtime support)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    
  },
  realtime: {
    WebSocket: w3cwebsocket, // ✅ THIS avoids the crash from `ws`
  } as any, // TypeScript workaround for React Native
});

// ✅ Admin client (no auth/session, no realtime override needed)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    WebSocket: w3cwebsocket, // Optional: You can add this too just to be safe
  } as any,
});
