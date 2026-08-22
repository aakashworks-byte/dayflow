import type { SupabaseClient } from '@supabase/supabase-js';

// src/core/auth/auth-context.ts
/**
 * AuthContext shape used across the backend.
 * Derived from Supabase JWT via auth.uid() and our custom bridge tables.
 */
export interface AuthContext {
  /** Supabase user ID (matches auth.users.id) */
  userId: string;
  /** Employee record ID (public.employees.id) linked to user */
  employeeId: string | null;
  /** Organization the user belongs to */
  organizationId: string;
  /** Role codes assigned to the user (e.g., ['HR_ADMIN','EMPLOYEE']) */
  roles: string[];
  /** Permission codes aggregated from roles */
  permissions: string[];
  /** Optional department ID for convenience */
  departmentId?: string | null;
  /** Optional location ID */
  locationId?: string | null;
  /** Direct report employee IDs (for UI convenience only) */
  directReportIds?: string[];
}

/**
 * Helper to construct AuthContext from Supabase session.
 * Uses database functions (auth_org_id, auth_employee_id) for authoritative data.
 */
export async function buildAuthContext(supabase: SupabaseClient): Promise<AuthContext> {
  // Fetch user id from JWT – Supabase client already validates it.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthenticated');
  }
  const userId = user.id;

  // Resolve organization and employee via helper functions (SQL).
  const { data: orgRes } = await supabase.rpc('auth_org_id');
  const organizationId = orgRes as string;
  const { data: empRes } = await supabase.rpc('auth_employee_id');
  const employeeId = empRes as string | null;

  // Load roles & permissions – lightweight join.
  type UserRoleRow = { role_id: string; role: { code: string } };
  type PermissionRow = { permission: { code: string } };

  const roleRows = (await supabase
    .from('user_roles')
    .select('role:roles(code),role_id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)).data as UserRoleRow[] | null;
  const roles = (roleRows ?? []).map(r => r.role?.code).filter(Boolean);

  const permRows = (await supabase
    .from('role_permissions')
    .select('permission:permissions(code)')
    .in('role_id', roleRows?.map(r => r.role_id) ?? [])).data as PermissionRow[] | null;
  const permissions = (permRows ?? []).map(p => p.permission?.code).filter(Boolean);

  return {
    userId,
    employeeId,
    organizationId,
    roles,
    permissions,
  };
}
