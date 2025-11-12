import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format before creating client
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only create client if we have valid credentials
if (!isValidUrl(supabaseUrl)) {
  console.error('❌ Invalid Supabase URL in .env file:', supabaseUrl);
  console.error('📍 Expected format: https://your-project-id.supabase.co');
  console.error('🔧 Please update your .env file with valid Supabase credentials');
}

export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key' ? supabaseAnonKey : 'placeholder-key'
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { connected: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    const { error } = await supabase.from('inhouse_offers').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase connection check failed:', error);
      return { connected: false, error: `Database connection error: ${error.message}` };
    }

    return { connected: true };
  } catch (error: any) {
    console.error('Supabase connection check exception:', error);
    return { connected: false, error: `Connection failed: ${error.message || 'Unknown error'}` };
  }
}

export async function checkUserAuthentication(): Promise<{ authenticated: boolean; user: any | null; error?: string }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Authentication check failed:', error);
      return { authenticated: false, user: null, error: `Auth error: ${error.message}` };
    }

    if (!user) {
      return { authenticated: false, user: null, error: 'User is not authenticated. Please sign in.' };
    }

    return { authenticated: true, user };
  } catch (error: any) {
    console.error('Authentication check exception:', error);
    return { authenticated: false, user: null, error: `Auth check failed: ${error.message || 'Unknown error'}` };
  }
}

export function getSupabaseErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  if (error.message) {
    if (error.code === '42501') {
      return 'Permission denied. You may not have access to perform this action.';
    }
    if (error.code === '23505') {
      return 'This record already exists. Please use a different identifier.';
    }
    if (error.code === '23503') {
      return 'Related record not found. Please ensure all required data exists.';
    }
    if (error.code === 'PGRST116') {
      return 'No data found or you do not have permission to access it.';
    }
    return error.message;
  }

  return JSON.stringify(error);
}

