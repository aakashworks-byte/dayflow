-- Migration 00007: Row Level Security (RLS) Helper Functions and Policies
-- Purpose: Implement robust multi-tenant authorization rooted strictly in Supabase auth.uid().

-- ============================================================================
-- 1. SECURE RLS HELPER FUNCTIONS (STABLE + SECURITY DEFINER)
-- ============================================================================

-- Helper 1: Get the current user's organization_id from public.users via auth.uid()
CREATE OR REPLACE FUNCTION public.auth_org_id() RETURNS UUID AS $$
  SELECT organization_id 
  FROM public.users 
  WHERE id = auth.uid() AND deleted_at IS NULL 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper 2: Get the current user's employee_id from public.employees via auth.uid()
CREATE OR REPLACE FUNCTION public.auth_employee_id() RETURNS UUID AS $$
  SELECT id 
  FROM public.employees 
  WHERE user_id = auth.uid() AND deleted_at IS NULL 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper 3: Check if the current auth.uid() possesses a specific permission code
CREATE OR REPLACE FUNCTION public.auth_has_permission(required_perm VARCHAR) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid() 
      AND ur.organization_id = public.auth_org_id()
      AND p.code = required_perm
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Helper 4: Recursive check if auth.uid()'s employee manages target_emp_id (direct or indirect)
CREATE OR REPLACE FUNCTION public.auth_is_manager_of(target_emp_id UUID) RETURNS BOOLEAN AS $$
  WITH RECURSIVE subordinates AS (
    SELECT id, manager_id FROM public.employees 
    WHERE manager_id = public.auth_employee_id() 
      AND organization_id = public.auth_org_id()
      AND deleted_at IS NULL
    UNION ALL
    SELECT e.id, e.manager_id FROM public.employees e
    INNER JOIN subordinates s ON s.id = e.manager_id
    WHERE e.organization_id = public.auth_org_id() 
      AND e.deleted_at IS NULL
  )
  SELECT EXISTS (SELECT 1 FROM subordinates WHERE id = target_emp_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL FOUNDATION TABLES
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES SPECIFICATION
-- ============================================================================

-- --- A. ORGANIZATIONS ---
DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;
CREATE POLICY "organizations_select_policy" ON public.organizations
  FOR SELECT USING (id = public.auth_org_id());

DROP POLICY IF EXISTS "organizations_update_policy" ON public.organizations;
CREATE POLICY "organizations_update_policy" ON public.organizations
  FOR UPDATE USING (
    id = public.auth_org_id() AND public.auth_has_permission('org:manage')
  );

-- --- B. USERS ---
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      id = auth.uid() 
      OR public.auth_has_permission('employee:read:all')
    )
  );

DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE USING (
    organization_id = public.auth_org_id() AND (
      id = auth.uid() 
      OR public.auth_has_permission('employee:write:all')
    )
  );

-- --- C. ROLES & PERMISSIONS ---
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
CREATE POLICY "roles_select_policy" ON public.roles
  FOR SELECT USING (
    organization_id IS NULL 
    OR organization_id = public.auth_org_id()
  );

DROP POLICY IF EXISTS "roles_write_policy" ON public.roles;
CREATE POLICY "roles_write_policy" ON public.roles
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('rbac:role:write')
  );

DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions
  FOR SELECT USING (true); -- Read-only capability registry

DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;
CREATE POLICY "role_permissions_select_policy" ON public.role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roles r 
      WHERE r.id = role_permissions.role_id 
        AND (r.organization_id IS NULL OR r.organization_id = public.auth_org_id())
    )
  );

DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
CREATE POLICY "user_roles_select_policy" ON public.user_roles
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "user_roles_write_policy" ON public.user_roles;
CREATE POLICY "user_roles_write_policy" ON public.user_roles
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('rbac:user_role:assign')
  );

-- --- D. LOCATIONS ---
DROP POLICY IF EXISTS "locations_select_policy" ON public.locations;
CREATE POLICY "locations_select_policy" ON public.locations
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "locations_write_policy" ON public.locations;
CREATE POLICY "locations_write_policy" ON public.locations
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('location:write')
  );

-- --- E. DEPARTMENTS ---
DROP POLICY IF EXISTS "departments_select_policy" ON public.departments;
CREATE POLICY "departments_select_policy" ON public.departments
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "departments_write_policy" ON public.departments;
CREATE POLICY "departments_write_policy" ON public.departments
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('dept:write')
  );

-- --- F. JOB PROFILES ---
DROP POLICY IF EXISTS "job_profiles_select_policy" ON public.job_profiles;
CREATE POLICY "job_profiles_select_policy" ON public.job_profiles
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "job_profiles_write_policy" ON public.job_profiles;
CREATE POLICY "job_profiles_write_policy" ON public.job_profiles
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('job_profile:write')
  );

-- --- G. EMPLOYEES ---
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;
CREATE POLICY "employees_select_policy" ON public.employees
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('employee:read:all')
      OR id = public.auth_employee_id()
      OR public.auth_is_manager_of(id)
    )
  );

DROP POLICY IF EXISTS "employees_write_policy" ON public.employees;
CREATE POLICY "employees_write_policy" ON public.employees
  FOR ALL USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('employee:write:all')
  );

-- --- H. AUDIT LOGS ---
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT USING (
    organization_id = public.auth_org_id() 
    AND public.auth_has_permission('audit:read')
  );

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id()
  );
