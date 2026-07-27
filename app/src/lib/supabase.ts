import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && !url.includes('YOUR_') && !anonKey.includes('YOUR_'));
}

export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder'
);
