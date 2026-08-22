import { createSupabaseServerClient } from '@/config/supabase-server';
import { buildAuthContext, AuthContext } from '@/core/auth/auth-context';
import { UnauthorizedError } from '@/core/errors/app-error';

/**
 * Retrieves the AuthContext for the current request.
 * Throws {@link UnauthorizedError} if the request is not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();
  try {
    const ctx = await buildAuthContext(supabase);
    return ctx;
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthenticated') {
      throw new UnauthorizedError();
    }
    throw e;
  }
}
