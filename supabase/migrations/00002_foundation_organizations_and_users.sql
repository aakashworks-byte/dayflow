-- Migration 00002: Organizations and Application Users Bridge
-- Purpose: Create root tenant organizations and user profiles bridged 1:1 to Supabase auth.users.

-- 1. Organizations (Root Tenant Entity)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  domain VARCHAR(255) NULL,
  default_timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  default_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Constraints
  CONSTRAINT chk_org_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT uq_organizations_id UNIQUE (id)
);

-- Partial Unique Indexes for Soft Deletes
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug_unique 
  ON public.organizations(slug) 
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_code_unique 
  ON public.organizations(code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_active 
  ON public.organizations(is_active) 
  WHERE deleted_at IS NULL;

-- 2. Users (Application Bridge to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_admin BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Constraints & Composite Key for Organization Isolation
  CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT uq_users_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
  ON public.users(email) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_org_active 
  ON public.users(organization_id, is_active) 
  WHERE deleted_at IS NULL;
