/**
 * Dayflow Unified Permissions Registry
 * Covers Foundation Master tables and Person 2 Downstream Capabilities
 */
export const PERMISSIONS = {
  // Organization Master
  ORG_READ: 'org:read',
  ORG_MANAGE: 'org:manage',
  DEPT_READ: 'dept:read',
  DEPT_WRITE: 'dept:write',
  LOCATION_READ: 'location:read',
  LOCATION_WRITE: 'location:write',
  JOB_PROFILE_READ: 'job_profile:read',
  JOB_PROFILE_WRITE: 'job_profile:write',

  // Employees & Directory
  EMPLOYEE_READ_SELF: 'employee:read:self',
  EMPLOYEE_READ_TEAM: 'employee:read:team',
  EMPLOYEE_READ_ALL: 'employee:read:all',
  EMPLOYEE_WRITE_ALL: 'employee:write:all',

  // RBAC & Security
  RBAC_ROLE_WRITE: 'rbac:role:write',
  RBAC_USER_ROLE_ASSIGN: 'rbac:user_role:assign',
  AUDIT_READ: 'audit:read',

  // Person 2: Attendance
  ATTENDANCE_LOG_SELF: 'attendance:log:self',
  ATTENDANCE_READ_TEAM: 'attendance:read:team',
  ATTENDANCE_READ_ALL: 'attendance:read:all',
  ATTENDANCE_APPROVE: 'attendance:approve',
  ATTENDANCE_ADMIN: 'attendance:admin',

  // Person 2: Leave
  LEAVE_APPLY_SELF: 'leave:apply:self',
  LEAVE_READ_TEAM: 'leave:read:team',
  LEAVE_READ_ALL: 'leave:read:all',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_ADMIN: 'leave:admin',

  // Person 2: Approval Workflows
  APPROVAL_SUBMIT: 'approval:submit',
  APPROVAL_ACTION: 'approval:action',
  APPROVAL_DELEGATE: 'approval:delegate',
  APPROVAL_VIEW_ALL: 'approval:view_all',

  // Person 2: Payroll
  PAYROLL_READ_SELF: 'payroll:read:self',
  PAYROLL_READ_ALL: 'payroll:read:all',
  PAYROLL_PROCESS: 'payroll:process',
  PAYROLL_ADMIN: 'payroll:admin',

  // Person 2: Policy Engine & Decision Trace
  POLICY_READ: 'policy:read',
  POLICY_EVALUATE: 'policy:evaluate',
  POLICY_MANAGE: 'policy:manage',
  DECISION_TRACE_READ: 'decision_trace:read',
  DECISION_TRACE_EXPORT: 'decision_trace:export',

  // Person 2: Workforce Intelligence
  ANALYTICS_VIEW_TEAM: 'analytics:view:team',
  ANALYTICS_VIEW_ORG: 'analytics:view:org',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | string;
