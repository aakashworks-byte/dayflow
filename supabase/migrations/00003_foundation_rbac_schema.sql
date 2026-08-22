-- Migration 00003: RBAC Schema (Roles, Permissions, and User Assignments)
-- Purpose: Normalized Role-Based Access Control supporting Global and Org-Scoped roles.

-- 1. Roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT uq_roles_org_id UNIQUE (organization_id, id)
);

-- Unique index treating NULL organization_id as global system roles
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_org_code_unique 
  ON public.roles(COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), code);

-- 2. Permissions Registry (Immutable capability dictionary)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);

-- 3. Role Permissions (Many-to-many role to permission mappings)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- 4. User Roles (Assigns roles to users with database-level tenant isolation)
CREATE TABLE IF NOT EXISTS public.user_roles (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (organization_id, user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (organization_id, user_id) 
    REFERENCES public.users(organization_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);

-- 5. Database Trigger: Enforce Cross-Tenant Role Isolation
-- Prevents assigning an Org A role to an Org B user
CREATE OR REPLACE FUNCTION public.check_user_role_org_match() RETURNS TRIGGER AS $$
DECLARE
  v_role_org UUID;
BEGIN
  SELECT organization_id INTO v_role_org FROM public.roles WHERE id = NEW.role_id;
  
  -- If role is not a global system role (organization_id IS NOT NULL), it must match user's organization
  IF v_role_org IS NOT NULL AND v_role_org != NEW.organization_id THEN
    RAISE EXCEPTION 'Cross-organization role assignment forbidden: role belongs to % but user belongs to %', 
      v_role_org, NEW.organization_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_roles_org_match ON public.user_roles;
CREATE TRIGGER trg_user_roles_org_match
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.check_user_role_org_match();
