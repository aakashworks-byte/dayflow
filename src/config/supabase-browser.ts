import { createBrowserClient } from '@supabase/ssr';
import { env } from './env';

/**
 * Creates a browser-safe Supabase client using public credentials.
 * Only uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
