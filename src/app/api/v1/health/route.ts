import { successResponse } from '@/core/http/api-response';


/**
 * Health check endpoint.
 * Returns a minimal JSON payload indicating the service is up.
 */
export async function GET() {
  return successResponse({ ok: true });
}
