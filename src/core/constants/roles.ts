/**
 * Dayflow Core Role Constants
 */
export const ROLES = {
  // Global System Roles (Cross-Tenant)
  SUPER_ADMIN: 'SUPER_ADMIN',
  AUDITOR: 'AUDITOR',

  // Organization-Scoped Roles
  HR_ADMIN: 'HR_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  LINE_MANAGER: 'LINE_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  PAYROLL_ADMIN: 'PAYROLL_ADMIN',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES] | string;
