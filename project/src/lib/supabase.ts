import { createClient } from '@supabase/supabase-js';

// Function to validate and format Supabase URL
function validateSupabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('Missing Supabase URL environment variable');
  }

  try {
    // Remove any trailing slashes and whitespace
    const cleanUrl = url.trim().replace(/\/+$/, '');
    
    // Add https:// if missing
    const urlWithProtocol = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
    
    // Test if it's a valid URL
    new URL(urlWithProtocol);
    
    return urlWithProtocol;
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error(`Invalid Supabase URL format: ${url}`);
  }
}

// Function to validate Supabase key
function validateSupabaseKey(key: string | undefined): string {
  if (!key) {
    throw new Error('Missing Supabase anon key environment variable');
  }

  const trimmedKey = key.trim();
  if (!trimmedKey.match(/^[a-zA-Z0-9._-]+$/)) {
    throw new Error('Invalid Supabase anon key format');
  }
  return trimmedKey;
}

// Create Supabase client with error handling
function createSupabaseClient() {
  try {
    const url = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
    const key = validateSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Return a mock client that gracefully fails all operations
    return {
      auth: {
        signUp: async () => ({ error: new Error('Supabase connection not available') }),
        signIn: async () => ({ error: new Error('Supabase connection not available') }),
        signOut: async () => ({ error: new Error('Supabase connection not available') }),
        signInWithOAuth: async () => ({ error: new Error('Supabase connection not available') }),
        signInWithPassword: async () => ({ error: new Error('Supabase connection not available') })
      },
      from: () => ({
        select: () => ({ error: new Error('Supabase connection not available') }),
        insert: () => ({ error: new Error('Supabase connection not available') }),
        update: () => ({ error: new Error('Supabase connection not available') }),
        delete: () => ({ error: new Error('Supabase connection not available') })
      })
    };
  }
}

// Create and export the Supabase client instance
export const supabase = createSupabaseClient();
