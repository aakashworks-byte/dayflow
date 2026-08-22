-- Migration 00004: Organization Structure (Locations, Departments, and Job Profiles)
-- Purpose: Master organizational entities supporting multi-office, department hierarchies, and job profiles.

-- 1. Locations (Offices, Branches, Remote Hubs)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address_line1 VARCHAR(255) NULL,
  address_line2 VARCHAR(255) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  geofence_latitude DECIMAL(10, 8) NULL,
  geofence_longitude DECIMAL(11, 8) NULL,
  geofence_radius_meters INTEGER NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Constraints
  CONSTRAINT uq_locations_org_id UNIQUE (organization_id, id),
  CONSTRAINT chk_locations_geofence_radius CHECK (geofence_radius_meters IS NULL OR geofence_radius_meters > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_org_code_unique 
  ON public.locations(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_locations_org 
  ON public.locations(organization_id) 
  WHERE deleted_at IS NULL;

-- 2. Departments (Hierarchical units with composite parent foreign key)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  parent_department_id UUID NULL,
  head_employee_id UUID NULL, -- Linked via composite FK after employees table is created
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  cost_center_code VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Constraints & Composite Hierarchy Foreign Key
  CONSTRAINT uq_departments_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_departments_parent FOREIGN KEY (organization_id, parent_department_id) 
    REFERENCES public.departments(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_departments_no_self_parent CHECK (parent_department_id != id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_org_code_unique 
  ON public.departments(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_departments_parent 
  ON public.departments(organization_id, parent_department_id) 
  WHERE deleted_at IS NULL;

-- 3. Job Profiles (Titles, Bands, and Levels)
CREATE TABLE IF NOT EXISTS public.job_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  job_family VARCHAR(100) NULL,
  band_level VARCHAR(50) NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Constraints
  CONSTRAINT uq_job_profiles_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_profiles_org_code_unique 
  ON public.job_profiles(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_job_profiles_org 
  ON public.job_profiles(organization_id) 
  WHERE deleted_at IS NULL;
