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
  } catch (error: unknown) {
    console.error('Supabase connection check exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { connected: false, error: `Connection failed: ${errorMessage}` };
  }
}

export async function checkUserAuthentication(): Promise<{ authenticated: boolean; user: { id: string; email?: string } | null; error?: string }> {
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
  } catch (error: unknown) {
    console.error('Authentication check exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { authenticated: false, user: null, error: `Auth check failed: ${errorMessage}` };
  }
}

export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    const err = error as Error & { code?: string; details?: string; hint?: string };
    if (err.code === '42501') {
      return 'Permission denied. You may not have access to perform this action.';
    }
    if (err.code === '23505') {
      return 'This record already exists. Please use a different identifier.';
    }
    if (err.code === '23503') {
      return 'Related record not found. Please ensure all required data exists.';
    }
    if (err.code === 'PGRST116') {
      return 'No data found or you do not have permission to access it.';
    }
    return err.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const errObj = error as { message: unknown; code?: unknown };
    if (errObj.code === '42501') {
      return 'Permission denied. You may not have access to perform this action.';
    }
    if (errObj.code === '23505') {
      return 'This record already exists. Please use a different identifier.';
    }
    if (errObj.code === '23503') {
      return 'Related record not found. Please ensure all required data exists.';
    }
    if (errObj.code === 'PGRST116') {
      return 'No data found or you do not have permission to access it.';
    }
    return String(errObj.message);
  }

  return JSON.stringify(error);
}

