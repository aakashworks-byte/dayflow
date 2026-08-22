-- Migration 00005: Employees Master and Reporting Lines
-- Purpose: Core employee profile with strict composite foreign keys ensuring organization isolation.

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  user_id UUID NULL,
  department_id UUID NOT NULL,
  job_profile_id UUID NOT NULL,
  location_id UUID NOT NULL,
  manager_id UUID NULL,
  employee_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NULL,
  work_email VARCHAR(255) NOT NULL,
  personal_email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  date_of_birth DATE NULL,
  gender public.gender_type NULL,
  joining_date DATE NOT NULL,
  exit_date DATE NULL,
  employment_type public.employment_type NOT NULL DEFAULT 'FULL_TIME',
  employment_status public.employment_status NOT NULL DEFAULT 'ACTIVE',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  custom_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  -- Composite Foreign Keys Guaranteeing Zero Cross-Organization References
  CONSTRAINT uq_employees_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_employees_user FOREIGN KEY (organization_id, user_id) 
    REFERENCES public.users(organization_id, id) ON DELETE SET NULL,
  CONSTRAINT fk_employees_department FOREIGN KEY (organization_id, department_id) 
    REFERENCES public.departments(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_employees_job_profile FOREIGN KEY (organization_id, job_profile_id) 
    REFERENCES public.job_profiles(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_employees_location FOREIGN KEY (organization_id, location_id) 
    REFERENCES public.locations(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_employees_manager FOREIGN KEY (organization_id, manager_id) 
    REFERENCES public.employees(organization_id, id) ON DELETE RESTRICT,

  -- Integrity Constraints
  CONSTRAINT chk_employees_no_self_manager CHECK (manager_id != id),
  CONSTRAINT chk_employees_exit_after_joining CHECK (exit_date IS NULL OR exit_date >= joining_date)
);

-- Unique Indexes (Scoped to organization where not soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_org_code_unique 
  ON public.employees(organization_id, employee_code) 
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_org_email_unique 
  ON public.employees(organization_id, work_email) 
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_user_unique 
  ON public.employees(user_id) 
  WHERE deleted_at IS NULL AND user_id IS NOT NULL;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employees_manager 
  ON public.employees(organization_id, manager_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employees_department 
  ON public.employees(organization_id, department_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employees_location 
  ON public.employees(organization_id, location_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employees_status 
  ON public.employees(organization_id, employment_status) 
  WHERE deleted_at IS NULL;

-- 2. Prevent Circular Manager Hierarchy Trigger
CREATE OR REPLACE FUNCTION public.check_manager_cycle() RETURNS TRIGGER AS $$
DECLARE
  v_current_id UUID := NEW.manager_id;
  v_depth INT := 0;
  v_max_depth INT := 50;
BEGIN
  IF NEW.manager_id IS NULL THEN
    RETURN NEW;
  END IF;

  WHILE v_current_id IS NOT NULL LOOP
    IF v_current_id = NEW.id THEN
      RAISE EXCEPTION 'Circular manager hierarchy detected: employee % cannot be managed by their own subordinate %', 
        NEW.id, NEW.manager_id;
    END IF;

    v_depth := v_depth + 1;
    IF v_depth > v_max_depth THEN
      RAISE EXCEPTION 'Maximum reporting hierarchy depth exceeded (>50 levels). Potential loop detected.';
    END IF;

    SELECT manager_id INTO v_current_id 
    FROM public.employees 
    WHERE id = v_current_id AND organization_id = NEW.organization_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employees_manager_cycle ON public.employees;
CREATE TRIGGER trg_employees_manager_cycle
BEFORE INSERT OR UPDATE OF manager_id ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.check_manager_cycle();

-- 3. Add Composite Foreign Key from departments(head_employee_id) -> employees(organization_id, id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_departments_head_employee'
  ) THEN
    ALTER TABLE public.departments
      ADD CONSTRAINT fk_departments_head_employee
      FOREIGN KEY (organization_id, head_employee_id)
      REFERENCES public.employees(organization_id, id)
      ON DELETE SET NULL;
  END IF;
END $$;
