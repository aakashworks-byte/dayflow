-- ============================================================================
-- Dayflow HRMS — Official Production-Quality Seed Data (Demo Organization)
-- ============================================================================

-- 1. Create Demo Organization (Root Tenant)
INSERT INTO public.organizations (
  id, name, slug, code, domain, default_timezone, default_currency, settings, is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Acme Corporation',
  'acme',
  'ACME',
  'acme.dayflow.io',
  'Asia/Kolkata',
  'USD',
  '{"fiscal_year_start_month": 4, "work_days": ["MON", "TUE", "WED", "THU", "FRI"]}'::jsonb,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  default_timezone = EXCLUDED.default_timezone;

-- 2. System Permissions Dictionary (Foundation + Person 2 Capabilities)
INSERT INTO public.permissions (id, code, module, action, description) VALUES
  -- Organization Master
  ('00000001-0000-0000-0000-000000000001', 'org:read', 'organization', 'read', 'Read organization master details'),
  ('00000001-0000-0000-0000-000000000002', 'org:manage', 'organization', 'manage', 'Full management over organization settings and root configuration'),
  ('00000001-0000-0000-0000-000000000003', 'dept:read', 'organization', 'read', 'Read departments'),
  ('00000001-0000-0000-0000-000000000004', 'dept:write', 'organization', 'write', 'Create, update, or delete departments'),
  ('00000001-0000-0000-0000-000000000005', 'location:read', 'organization', 'read', 'Read location details'),
  ('00000001-0000-0000-0000-000000000006', 'location:write', 'organization', 'write', 'Create, update, or delete locations'),
  ('00000001-0000-0000-0000-000000000007', 'job_profile:read', 'organization', 'read', 'Read job profiles and bands'),
  ('00000001-0000-0000-0000-000000000008', 'job_profile:write', 'organization', 'write', 'Create or update job profiles and salary bands'),

  -- Employees & Directory
  ('00000002-0000-0000-0000-000000000001', 'employee:read:self', 'employee', 'read', 'Read own employee profile and documents'),
  ('00000002-0000-0000-0000-000000000002', 'employee:read:team', 'employee', 'read', 'Read direct and indirect team reports'),
  ('00000002-0000-0000-0000-000000000003', 'employee:read:all', 'employee', 'read', 'Read all employee records in organization'),
  ('00000002-0000-0000-0000-000000000004', 'employee:write:all', 'employee', 'write', 'Create, update, or onboard employees across organization'),

  -- RBAC & Security
  ('00000003-0000-0000-0000-000000000001', 'rbac:role:write', 'rbac', 'write', 'Create and modify custom roles and permission bindings'),
  ('00000003-0000-0000-0000-000000000002', 'rbac:user_role:assign', 'rbac', 'assign', 'Assign roles to users'),
  ('00000003-0000-0000-0000-000000000003', 'audit:read', 'audit', 'read', 'Read and query immutable audit trails'),

  -- Downstream Person 2 Reserved Permissions: Attendance
  ('00000004-0000-0000-0000-000000000001', 'attendance:log:self', 'attendance', 'log', 'Log own check-in and check-out attendance'),
  ('00000004-0000-0000-0000-000000000002', 'attendance:read:team', 'attendance', 'read', 'View team attendance logs'),
  ('00000004-0000-0000-0000-000000000003', 'attendance:read:all', 'attendance', 'read', 'View organization-wide attendance records'),
  ('00000004-0000-0000-0000-000000000004', 'attendance:approve', 'attendance', 'approve', 'Approve attendance regularization requests'),
  ('00000004-0000-0000-0000-000000000005', 'attendance:admin', 'attendance', 'admin', 'Configure attendance shifts and biometric devices'),

  -- Downstream Person 2 Reserved Permissions: Leave
  ('00000005-0000-0000-0000-000000000001', 'leave:apply:self', 'leave', 'apply', 'Submit self leave requests'),
  ('00000005-0000-0000-0000-000000000002', 'leave:read:team', 'leave', 'read', 'View team leave requests and calendars'),
  ('00000005-0000-0000-0000-000000000003', 'leave:read:all', 'leave', 'read', 'View organization-wide leave requests and balances'),
  ('00000005-0000-0000-0000-000000000004', 'leave:approve', 'leave', 'approve', 'Approve or reject subordinate leave requests'),
  ('00000005-0000-0000-0000-000000000005', 'leave:admin', 'leave', 'admin', 'Manage leave types, quotas, and holiday calendars'),

  -- Downstream Person 2 Reserved Permissions: Approvals
  ('00000006-0000-0000-0000-000000000001', 'approval:submit', 'approvals', 'submit', 'Submit items into approval workflows'),
  ('00000006-0000-0000-0000-000000000002', 'approval:action', 'approvals', 'action', 'Approve, reject, or delegate workflow items'),
  ('00000006-0000-0000-0000-000000000003', 'approval:delegate', 'approvals', 'delegate', 'Delegate approval authority'),
  ('00000006-0000-0000-0000-000000000004', 'approval:view_all', 'approvals', 'view', 'View all workflow instances across organization'),

  -- Downstream Person 2 Reserved Permissions: Payroll
  ('00000007-0000-0000-0000-000000000001', 'payroll:read:self', 'payroll', 'read', 'View own payslips and compensation details'),
  ('00000007-0000-0000-0000-000000000002', 'payroll:read:all', 'payroll', 'read', 'View all compensation and salary structures'),
  ('00000007-0000-0000-0000-000000000003', 'payroll:process', 'payroll', 'process', 'Run payroll computations and finalize pay runs'),
  ('00000007-0000-0000-0000-000000000004', 'payroll:admin', 'payroll', 'admin', 'Manage salary structures, deductions, and tax configurations'),

  -- Downstream Person 2 Reserved Permissions: Policy Engine & Decision Trace
  ('00000008-0000-0000-0000-000000000001', 'policy:read', 'policy', 'read', 'Read active policies and evaluation criteria'),
  ('00000008-0000-0000-0000-000000000002', 'policy:evaluate', 'policy', 'evaluate', 'Trigger policy rule evaluations'),
  ('00000008-0000-0000-0000-000000000003', 'policy:manage', 'policy', 'manage', 'Create, modify, and delete policy rules'),
  ('00000009-0000-0000-0000-000000000001', 'decision_trace:read', 'decision_trace', 'read', 'Query and view policy decision traces'),
  ('00000009-0000-0000-0000-000000000002', 'decision_trace:export', 'decision_trace', 'export', 'Export decision trace audit packets'),

  -- Downstream Person 2 Reserved Permissions: Workforce Intelligence
  ('00000010-0000-0000-0000-000000000001', 'analytics:view:team', 'analytics', 'view', 'View team workforce metrics'),
  ('00000010-0000-0000-0000-000000000002', 'analytics:view:org', 'analytics', 'view', 'View organization-wide workforce metrics and attrition'),
  ('00000010-0000-0000-0000-000000000003', 'analytics:export', 'analytics', 'export', 'Export workforce intelligence reports')
ON CONFLICT (code) DO NOTHING;

-- 3. Roles (Global and Org-Scoped)
INSERT INTO public.roles (id, organization_id, code, name, description, is_system_role) VALUES
  -- Global System Roles
  ('00000020-0000-0000-0000-000000000001', NULL, 'SUPER_ADMIN', 'Platform Super Administrator', 'Cross-tenant platform administrator with total root access', true),
  ('00000020-0000-0000-0000-000000000002', NULL, 'AUDITOR', 'Compliance Auditor', 'Read-only compliance officer with access to logs and analytics', true),
  
  -- Organization-Scoped Roles for Acme Corp
  ('00000020-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'HR_ADMIN', 'HR Administrator', 'Full administrative authority over human resources and employee records', false),
  ('00000020-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'HR_MANAGER', 'HR Manager', 'Operational HR management, employee onboarding, and policy reviews', false),
  ('00000020-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'LINE_MANAGER', 'Line / Team Manager', 'Team lead with managerial approval authority over direct reports', false),
  ('00000020-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'EMPLOYEE', 'Employee (Standard User)', 'Standard employee with self-service attendance, leave, and profile access', false),
  ('00000020-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'PAYROLL_ADMIN', 'Payroll Administrator', 'Compensation and payroll manager responsible for salary disbursement', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Role-to-Permission Mappings
DO $$
DECLARE
  v_role_super_admin UUID := '00000020-0000-0000-0000-000000000001';
  v_role_auditor UUID     := '00000020-0000-0000-0000-000000000002';
  v_role_hr_admin UUID    := '00000020-0000-0000-0000-000000000003';
  v_role_hr_manager UUID  := '00000020-0000-0000-0000-000000000004';
  v_role_line_mgr UUID    := '00000020-0000-0000-0000-000000000005';
  v_role_employee UUID    := '00000020-0000-0000-0000-000000000006';
  v_role_payroll UUID     := '00000020-0000-0000-0000-000000000007';
BEGIN
  -- SUPER_ADMIN: All Permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_super_admin, id FROM public.permissions
  ON CONFLICT DO NOTHING;

  -- AUDITOR: Read-only audit & analytics
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_auditor, id FROM public.permissions 
  WHERE code IN ('org:read', 'dept:read', 'location:read', 'job_profile:read', 'employee:read:all', 'audit:read', 'decision_trace:read', 'decision_trace:export', 'analytics:view:org')
  ON CONFLICT DO NOTHING;

  -- HR_ADMIN: All Org, Dept, Location, JobProfile, Employee, Leave Admin, Attendance Admin, Policy
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_hr_admin, id FROM public.permissions
  WHERE code IN (
    'org:manage', 'org:read', 'dept:write', 'dept:read', 'location:write', 'location:read', 
    'job_profile:write', 'job_profile:read', 'employee:read:all', 'employee:read:team', 'employee:read:self', 
    'employee:write:all', 'rbac:user_role:assign', 'audit:read', 'attendance:log:self', 'attendance:read:all', 
    'attendance:approve', 'attendance:admin', 'leave:apply:self', 'leave:read:all', 'leave:approve', 'leave:admin', 
    'approval:submit', 'approval:action', 'approval:view_all', 'payroll:read:self', 'policy:read', 'policy:evaluate', 
    'policy:manage', 'decision_trace:read', 'analytics:view:org'
  )
  ON CONFLICT DO NOTHING;

  -- HR_MANAGER
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_hr_manager, id FROM public.permissions
  WHERE code IN (
    'org:read', 'dept:read', 'location:read', 'job_profile:read', 'employee:read:all', 'employee:read:team', 
    'employee:read:self', 'attendance:log:self', 'attendance:read:team', 'attendance:approve', 'leave:apply:self', 
    'leave:read:team', 'leave:approve', 'approval:submit', 'approval:action', 'payroll:read:self', 'policy:read', 
    'policy:evaluate', 'analytics:view:org'
  )
  ON CONFLICT DO NOTHING;

  -- LINE_MANAGER
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_line_mgr, id FROM public.permissions
  WHERE code IN (
    'org:read', 'dept:read', 'location:read', 'job_profile:read', 'employee:read:team', 'employee:read:self', 
    'attendance:log:self', 'attendance:read:team', 'attendance:approve', 'leave:apply:self', 'leave:read:team', 
    'leave:approve', 'approval:submit', 'approval:action', 'payroll:read:self', 'policy:read', 'analytics:view:team'
  )
  ON CONFLICT DO NOTHING;

  -- EMPLOYEE (Self-service only)
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_employee, id FROM public.permissions
  WHERE code IN (
    'org:read', 'dept:read', 'location:read', 'job_profile:read', 'employee:read:self', 'attendance:log:self', 
    'leave:apply:self', 'approval:submit', 'payroll:read:self', 'policy:read'
  )
  ON CONFLICT DO NOTHING;

  -- PAYROLL_ADMIN
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_payroll, id FROM public.permissions
  WHERE code IN (
    'org:read', 'dept:read', 'location:read', 'job_profile:read', 'employee:read:all', 'employee:read:self', 
    'payroll:read:self', 'payroll:read:all', 'payroll:process', 'payroll:admin', 'analytics:view:org'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- 5. Locations (Offices)
INSERT INTO public.locations (
  id, organization_id, name, code, address_line1, city, state, country, postal_code, timezone, geofence_latitude, geofence_longitude, geofence_radius_meters, is_active
) VALUES
  ('00000030-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'San Francisco Headquarters', 'LOC-SF-HQ', '500 Howard Street, Suite 400', 'San Francisco', 'CA', 'United States', '94105', 'America/Los_Angeles', 37.7885, -122.3987, 200, true),
  ('00000030-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Bengaluru Engineering Hub', 'LOC-BLR-01', 'Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', 'India', '560103', 'Asia/Kolkata', 12.9279, 77.6801, 300, true),
  ('00000030-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'London European Hub', 'LOC-LDN-01', '100 Bishopsgate', 'London', 'Greater London', 'United Kingdom', 'EC2N 4AG', 'Europe/London', 51.5154, -0.0827, 250, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Departments (Hierarchical Tree)
INSERT INTO public.departments (
  id, organization_id, parent_department_id, name, code, cost_center_code, is_active
) VALUES
  ('00000040-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', NULL, 'Executive Office', 'DEP-EXEC', 'CC-100', true),
  ('00000040-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000001', 'Engineering', 'DEP-ENG', 'CC-200', true),
  ('00000040-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000002', 'Backend Core Platform', 'DEP-ENG-CORE', 'CC-201', true),
  ('00000040-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000001', 'People & Culture (HR)', 'DEP-HR', 'CC-300', true),
  ('00000040-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000001', 'Finance & Operations', 'DEP-FIN', 'CC-400', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Job Profiles
INSERT INTO public.job_profiles (
  id, organization_id, title, code, job_family, band_level, description, is_active
) VALUES
  ('00000050-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Chief Executive Officer', 'JP-EXEC-CEO', 'Executive', 'Executive', 'Corporate executive leadership and strategy', true),
  ('00000050-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'VP of Engineering', 'JP-ENG-VP', 'Engineering', 'Executive', 'Leads engineering teams and technical strategy', true),
  ('00000050-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Principal Architect', 'JP-ENG-ARCH', 'Engineering', 'L6', 'Technical architecture, scalability, and system design', true),
  ('00000050-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Senior Backend Engineer', 'JP-ENG-SR', 'Engineering', 'L4', 'Core platform backend development and API systems', true),
  ('00000050-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Director of People', 'JP-HR-DIR', 'People', 'L5', 'HR policies, employee engagement, and talent management', true),
  ('00000050-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Payroll & Benefits Specialist', 'JP-FIN-PAY', 'Finance', 'L3', 'Payroll execution, tax processing, and benefits administration', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Test Auth Users in auth.users (Using standard Supabase internal hashing)
-- All accounts have password: Password123!
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@dayflow.io', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Alex Vance"}'::jsonb, now(), now()),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr@dayflow.io', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Elena Rostova"}'::jsonb, now(), now()),
  ('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@dayflow.io', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sarah Connor"}'::jsonb, now(), now()),
  ('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'engineer@dayflow.io', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"David Chen"}'::jsonb, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 9. Bridge Users (public.users)
INSERT INTO public.users (
  id, organization_id, email, phone, is_active, is_system_admin, metadata
) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin@dayflow.io', '+1-555-0100', true, true, '{"title":"CEO & System Admin"}'::jsonb),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'hr@dayflow.io', '+1-555-0101', true, false, '{"title":"HR Administrator"}'::jsonb),
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'manager@dayflow.io', '+1-555-0102', true, false, '{"title":"VP of Engineering / Line Manager"}'::jsonb),
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'engineer@dayflow.io', '+91-98765-43210', true, false, '{"title":"Senior Backend Engineer"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 10. Employees with Multi-Level Reporting Hierarchy
-- Hierarchy:
-- Alex Vance (CEO) -> Sarah Connor (VP Eng) -> David Chen (Senior Eng)
-- Alex Vance (CEO) -> Elena Rostova (HR Dir)
INSERT INTO public.employees (
  id, organization_id, user_id, department_id, job_profile_id, location_id, manager_id,
  employee_code, first_name, last_name, display_name, work_email, joining_date,
  employment_type, employment_status, timezone
) VALUES
  -- 1. CEO (Top of Hierarchy)
  ('e0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000001', '00000050-0000-0000-0000-000000000001', '00000030-0000-0000-0000-000000000001', NULL, 'EMP-001', 'Alex', 'Vance', 'Alex Vance', 'admin@dayflow.io', '2023-01-01', 'FULL_TIME', 'ACTIVE', 'America/Los_Angeles'),
  
  -- 2. VP of Engineering (Reports to CEO)
  ('e0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000002', '00000050-0000-0000-0000-000000000002', '00000030-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'EMP-002', 'Sarah', 'Connor', 'Sarah Connor', 'manager@dayflow.io', '2023-02-01', 'FULL_TIME', 'ACTIVE', 'America/Los_Angeles'),
  
  -- 3. Senior Backend Engineer (Reports to VP of Engineering)
  ('e0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000040-0000-0000-0000-000000000003', '00000050-0000-0000-0000-000000000004', '00000030-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000002', 'EMP-003', 'David', 'Chen', 'David Chen', 'engineer@dayflow.io', '2023-03-15', 'FULL_TIME', 'ACTIVE', 'Asia/Kolkata'),
  
  -- 4. HR Director (Reports to CEO)
  ('e0000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', '00000040-0000-0000-0000-000000000004', '00000050-0000-0000-0000-000000000005', '00000030-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'EMP-004', 'Elena', 'Rostova', 'Elena Rostova', 'hr@dayflow.io', '2023-01-15', 'FULL_TIME', 'ACTIVE', 'America/Los_Angeles')
ON CONFLICT (id) DO NOTHING;

-- Update Department Head references
UPDATE public.departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000001' WHERE id = '00000040-0000-0000-0000-000000000001';
UPDATE public.departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000002' WHERE id = '00000040-0000-0000-0000-000000000002';
UPDATE public.departments SET head_employee_id = 'e0000001-0000-0000-0000-000000000004' WHERE id = '00000040-0000-0000-0000-000000000004';

-- 11. Assign User Roles
INSERT INTO public.user_roles (organization_id, user_id, role_id) VALUES
  -- Alex Vance: SUPER_ADMIN (Global) & HR_ADMIN
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '00000020-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '00000020-0000-0000-0000-000000000003'),

  -- Elena Rostova: HR_ADMIN
  ('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', '00000020-0000-0000-0000-000000000003'),

  -- Sarah Connor: LINE_MANAGER & EMPLOYEE
  ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '00000020-0000-0000-0000-000000000005'),
  ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '00000020-0000-0000-0000-000000000006'),

  -- David Chen: EMPLOYEE
  ('11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000020-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;

-- 12. Initial Immutable Audit Trail Entry
INSERT INTO public.audit_logs (
  organization_id, actor_user_id, actor_employee_id, trace_id, action, resource_type, resource_id, metadata
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'e0000001-0000-0000-0000-000000000001',
  'seed-trace-0000-0000-0000-000000000001',
  'organization.seeded',
  'organizations',
  '11111111-1111-1111-1111-111111111111',
  '{"note": "Demo organization Acme Corp initialized with master seed records."}'::jsonb
);
