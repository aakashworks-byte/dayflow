import { createSupabaseServerClient } from '@/config/supabase-server';
import { getAuthContext } from '@/core/auth/api-auth';
import { successResponse, errorResponse } from '@/core/http/api-response';
import { UnauthorizedError } from '@/core/errors/app-error';

/**
 * Returns the profile of the currently authenticated employee.
 * Only safe, non‑sensitive fields are exposed.
 */
export async function GET() {
  try {
    // Ensure the request is authenticated and obtain context
    const auth = await getAuthContext();
    const { employeeId, organizationId } = auth;
    if (!employeeId) {
      // No employee linked to the user
      throw new UnauthorizedError('User not linked to an employee');
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('employees')
      .select(
        'id,employee_code,first_name,last_name,display_name,work_email,organization_id,department_id,location_id,manager_id,employment_status,employment_type,timezone'
      )
      .eq('id', employeeId)
      .single();

    if (error) {
      // Propagate as internal error (could be permission denied via RLS)
      throw error;
    }

    // Ensure organization isolation (RLS should already enforce, but double‑check)
    if (data.organization_id !== organizationId) {
      throw new UnauthorizedError('Organization mismatch');
    }

    return successResponse(data);
  } catch (e) {
    // Convert any thrown error into a proper API error response
    return errorResponse(e);
  }
}
