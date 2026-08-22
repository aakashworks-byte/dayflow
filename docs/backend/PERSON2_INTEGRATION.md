# Person 2 Integration Contract — Dayflow HRMS Backend

This document defines the formal integration contract for **Backend Person 2 (Operations & Intelligence Modules)** building on top of the **Dayflow Foundation Kernel (Backend Person 1)**.

---

## 1. Unified Architecture Rules (Zero Duplication)

1. **ONE Integrated Backend & Single Database**: All downstream business logic integrates into the single Dayflow Next.js 15 repository and Supabase PostgreSQL database.
2. **Zero Duplicate Entities**:
   - Do **NOT** create duplicate User, Employee, Department, Job Profile, Location, Role, or Permission tables.
   - Do **NOT** create duplicate authentication schemes, JWT parsers, or permission engines.
3. **Database-Level Tenant Isolation**:
   - All Person 2 tables **MUST** include `organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE`.
   - All foreign keys referencing Foundation tables **MUST** use composite foreign keys: `(organization_id, <target_id>) REFERENCES public.<table_name>(organization_id, id)`.

---

## 2. Foundation-Owned Master Tables

| Table | Purpose | Primary Key | Composite Key for Isolation |
|---|---|---|---|
| `public.organizations` | Enterprise tenant root | `id UUID` | `(id)` |
| `public.users` | Supabase Auth identity bridge | `id UUID` | `(organization_id, id)` |
| `public.roles` | Global & Tenant RBAC Roles | `id UUID` | `(organization_id, id)` |
| `public.permissions` | Capability registry | `id UUID` | `(code)` |
| `public.role_permissions` | Role-to-permission mapping | `(role_id, permission_id)` | — |
| `public.user_roles` | User role assignment | `(organization_id, user_id, role_id)` | `(organization_id, user_id)` |
| `public.locations` | Office & work sites | `id UUID` | `(organization_id, id)` |
| `public.departments` | Department tree structure | `id UUID` | `(organization_id, id)` |
| `public.job_profiles` | Titles, bands & grades | `id UUID` | `(organization_id, id)` |
| `public.employees` | Central employee record | `id UUID` | `(organization_id, id)` |
| `public.audit_logs` | Immutable audit trail | `id UUID` | `(organization_id, id)` |

---

## 3. Canonical Identifiers

All IDs are standard PostgreSQL `UUID` (`gen_random_uuid()`):
- **User ID (`user_id`)**: `UUID` (1:1 with Supabase `auth.users(id)`).
- **Employee ID (`employee_id`)**: `UUID` primary key of `public.employees`.
- **Organization ID (`organization_id`)**: `UUID` primary key of `public.organizations`.
- **Department ID (`department_id`)**: `UUID` primary key of `public.departments`.
- **Job Profile ID (`job_profile_id`)**: `UUID` primary key of `public.job_profiles`.
- **Location ID (`location_id`)**: `UUID` primary key of `public.locations`.
- **Manager ID (`manager_id`)**: `UUID` self-referencing foreign key on `public.employees(id)`.

---

## 4. How Person 2 Consumes Authentication & Context

### In Route Handlers (`src/app/api/v1/...`):
Use the shared `createApiHandler` higher-order wrapper or `createSupabaseServerClient`:

```typescript
import { createApiHandler } from '@/core/http/api-handler';
import { z } from 'zod';

export const POST = createApiHandler({
  auth: true,
  permissions: ['leave:apply:self'],
  schema: ApplyLeaveSchema,
  handler: async ({ body, auth, traceId, supabase }) => {
    // Access authenticated context safely:
    const { userId, employeeId, organizationId } = auth;
    
    // Execute query via RLS-scoped Supabase client:
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        organization_id: organizationId,
        employee_id: employeeId,
        ...body
      })
      .select()
      .single();

    return { status: 201, data };
  }
});
```

---

## 5. How Person 2 Consumes RBAC & RLS

### In Database Migrations (RLS Policies):
Always evaluate identity and multi-tenant scoping via Foundation SQL helper functions:

```sql
-- Helper Functions Available in public schema:
-- 1. public.auth_org_id() -> Returns UUID of current user's organization
-- 2. public.auth_employee_id() -> Returns UUID of current user's linked employee record
-- 3. public.auth_has_permission(permission_code VARCHAR) -> Returns BOOLEAN
-- 4. public.auth_is_manager_of(target_emp_id UUID) -> Returns BOOLEAN

-- Example Person 2 RLS Policy for Leave Requests:
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_requests_select" ON public.leave_requests
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('leave:read:all')
    )
  );

CREATE POLICY "leave_requests_insert" ON public.leave_requests
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id()
    AND employee_id = public.auth_employee_id()
  );
```

---

## 6. How Person 2 Records Audit Events

All mutations should emit audit entries to `public.audit_logs` using the shared utility `recordAuditLog`:

```typescript
import { recordAuditLog } from '@/core/audit/audit-logger';

await recordAuditLog({
  organizationId: auth.organizationId,
  actorUserId: auth.userId,
  actorEmployeeId: auth.employeeId,
  traceId: traceId,
  action: 'leave.request_approved',
  resourceType: 'leave_requests',
  resourceId: leaveRequestId,
  beforeState: previousRecord,
  afterState: updatedRecord,
  metadata: { approvedDays: 3, approverComments: 'Approved' },
  ipAddress: req.headers.get('x-forwarded-for') || undefined,
  userAgent: req.headers.get('user-agent') || undefined
});
```

---

## 7. Module-by-Module Specification (Person 2 Domains)

### 1. Attendance
- **Tables Created**: `attendance_records`, `attendance_shifts`, `biometric_devices`.
- **References**:
  - `FOREIGN KEY (organization_id, employee_id) REFERENCES public.employees(organization_id, id) ON DELETE CASCADE`
  - `FOREIGN KEY (organization_id, location_id) REFERENCES public.locations(organization_id, id) ON DELETE RESTRICT`
- **Permissions Registered**: `attendance:log:self`, `attendance:read:team`, `attendance:read:all`, `attendance:approve`, `attendance:admin`.
- **Audit Events**: `attendance.check_in`, `attendance.check_out`, `attendance.record_regularized`.

### 2. Leave
- **Tables Created**: `leave_types`, `leave_balances`, `leave_requests`, `holiday_calendars`.
- **References**:
  - `FOREIGN KEY (organization_id, employee_id) REFERENCES public.employees(organization_id, id) ON DELETE CASCADE`
  - `FOREIGN KEY (organization_id, approver_id) REFERENCES public.employees(organization_id, id) ON DELETE SET NULL`
- **Permissions Registered**: `leave:apply:self`, `leave:read:team`, `leave:read:all`, `leave:approve`, `leave:admin`.
- **Audit Events**: `leave.applied`, `leave.approved`, `leave.rejected`, `leave.balance_adjusted`.

### 3. Approval Workflows
- **Tables Created**: `approval_definitions`, `approval_instances`, `approval_steps`, `approval_actions`.
- **References**:
  - `FOREIGN KEY (organization_id, requester_id) REFERENCES public.employees(organization_id, id) ON DELETE CASCADE`
  - `FOREIGN KEY (organization_id, current_actor_id) REFERENCES public.employees(organization_id, id) ON DELETE SET NULL`
- **Permissions Registered**: `approval:submit`, `approval:action`, `approval:delegate`, `approval:view_all`.
- **Audit Events**: `approval.step_approved`, `approval.step_rejected`, `approval.workflow_completed`.

### 4. Payroll
- **Tables Created**: `salary_structures`, `employee_salaries`, `payroll_runs`, `payslips`, `tax_declarations`.
- **References**:
  - `FOREIGN KEY (organization_id, employee_id) REFERENCES public.employees(organization_id, id) ON DELETE RESTRICT`
  - `FOREIGN KEY (organization_id, department_id) REFERENCES public.departments(organization_id, id) ON DELETE RESTRICT`
- **Permissions Registered**: `payroll:read:self`, `payroll:read:all`, `payroll:process`, `payroll:admin`.
- **Audit Events**: `payroll.run_initiated`, `payroll.run_finalized`, `payroll.salary_updated`.

### 5. Policy Engine
- **Tables Created**: `policies`, `policy_rules`, `policy_evaluations`.
- **References**:
  - `FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE`
- **Permissions Registered**: `policy:read`, `policy:evaluate`, `policy:manage`.
- **Audit Events**: `policy.created`, `policy.updated`, `policy.evaluation_failed`.

### 6. Decision Trace
- **Tables Created**: `decision_traces`, `decision_trace_nodes`.
- **References**:
  - `FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE`
  - `actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL`
- **Permissions Registered**: `decision_trace:read`, `decision_trace:export`.
- **Audit Events**: `decision_trace.queried`, `decision_trace.exported`.

### 7. Workforce Intelligence
- **Tables Created**: `workforce_snapshots`, `headcount_metrics`, `turnover_metrics`.
- **References**: Composite foreign keys to `organizations`, `employees`, `departments`, and `locations`.
- **Permissions Registered**: `analytics:view:team`, `analytics:view:org`, `analytics:export`.
- **Audit Events**: `analytics.report_generated`.

---

## 8. Migration Rules for Person 2

1. **Migration Sequence**:
   - Foundation baseline migrations are locked: `00001` through `00007`.
   - Person 2 migrations must be named sequentially starting from `00008_...` (or timestamped `YYYYMMDD..._p2_...`).
2. **Never modify existing merged migrations**: Always create new forward migrations.
3. **Local Testing Requirement**:
   - Run `npx supabase db reset` before opening a pull request to ensure all migrations execute cleanly from scratch.
