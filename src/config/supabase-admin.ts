import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: supabase-admin.ts must NEVER be imported or executed in browser code.');
}

/**
 * Admin Service-Role Supabase client.
 * WARNING: Bypasses Row Level Security (RLS).
 * Only use for system operations, webhooks, or background jobs.
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
