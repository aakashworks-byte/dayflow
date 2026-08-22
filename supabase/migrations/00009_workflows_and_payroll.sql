-- Migration 00009: Operations — Approval Workflows Engine & Payroll Modules
-- Purpose: Schema, composite foreign keys, indexes, and RLS policies for Approval Workflows and Payroll.

-- ============================================================================
-- 1. APPROVAL WORKFLOWS SCHEMA
-- ============================================================================

-- 1.1 Approval Definitions
CREATE TABLE IF NOT EXISTS public.approval_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  entity_type VARCHAR(100) NOT NULL,
  steps_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_approval_definitions_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_approval_definitions_org_code 
  ON public.approval_definitions(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_approval_definitions_org 
  ON public.approval_definitions(organization_id) 
  WHERE deleted_at IS NULL;

-- 1.2 Approval Instances
CREATE TABLE IF NOT EXISTS public.approval_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  definition_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  current_step_order INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_approval_instances_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_approval_instances_definition FOREIGN KEY (organization_id, definition_id)
    REFERENCES public.approval_definitions(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_approval_instances_requester FOREIGN KEY (organization_id, requester_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_approval_instances_requester 
  ON public.approval_instances(organization_id, requester_id);

CREATE INDEX IF NOT EXISTS idx_approval_instances_status 
  ON public.approval_instances(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_approval_instances_entity 
  ON public.approval_instances(organization_id, entity_type, entity_id);

-- 1.3 Approval Steps
CREATE TABLE IF NOT EXISTS public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL,
  step_order INTEGER NOT NULL,
  name VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  assigned_role VARCHAR(50) NULL,
  assigned_employee_id UUID NULL,
  actioned_by UUID NULL,
  actioned_at TIMESTAMPTZ NULL,
  comments TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_approval_steps_org_id UNIQUE (organization_id, id),
  CONSTRAINT uq_approval_steps_instance_order UNIQUE (organization_id, instance_id, step_order),
  CONSTRAINT fk_approval_steps_instance FOREIGN KEY (organization_id, instance_id)
    REFERENCES public.approval_instances(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_approval_steps_assigned_emp FOREIGN KEY (organization_id, assigned_employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL,
  CONSTRAINT fk_approval_steps_actioned_by FOREIGN KEY (organization_id, actioned_by)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_steps_assigned_emp 
  ON public.approval_steps(organization_id, assigned_employee_id, status);

-- 1.4 Approval Actions
CREATE TABLE IF NOT EXISTS public.approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  step_id UUID NOT NULL,
  actor_employee_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  delegated_to_employee_id UUID NULL,
  comments TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_approval_actions_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_approval_actions_step FOREIGN KEY (organization_id, step_id)
    REFERENCES public.approval_steps(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_approval_actions_actor FOREIGN KEY (organization_id, actor_employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_approval_actions_delegated FOREIGN KEY (organization_id, delegated_to_employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_step 
  ON public.approval_actions(organization_id, step_id);

-- ============================================================================
-- 2. PAYROLL SCHEMA
-- ============================================================================

-- 2.1 Salary Structures
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_salary_structures_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_structures_org_code 
  ON public.salary_structures(organization_id, code) 
  WHERE deleted_at IS NULL;

-- 2.2 Employee Salaries
CREATE TABLE IF NOT EXISTS public.employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  salary_structure_id UUID NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  annual_ctc DECIMAL(12, 2) NOT NULL,
  monthly_gross DECIMAL(12, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_employee_salaries_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_employee_salaries_emp FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_employee_salaries_structure FOREIGN KEY (organization_id, salary_structure_id)
    REFERENCES public.salary_structures(organization_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_employee_salaries_emp 
  ON public.employee_salaries(organization_id, employee_id, is_active);

-- 2.3 Payroll Runs
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  total_gross_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  total_deductions_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  total_net_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  total_employees_count INTEGER NOT NULL DEFAULT 0,
  processed_by UUID NULL,
  finalized_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_payroll_runs_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_payroll_runs_dept FOREIGN KEY (organization_id, department_id)
    REFERENCES public.departments(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_payroll_runs_processed_by FOREIGN KEY (organization_id, processed_by)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_runs_period_dept 
  ON public.payroll_runs(organization_id, COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid), period_year, period_month)
  WHERE status != 'CANCELLED';

-- 2.4 Payslips
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  gross_pay DECIMAL(12, 2) NOT NULL,
  total_deductions DECIMAL(12, 2) NOT NULL,
  net_pay DECIMAL(12, 2) NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_payslips_org_id UNIQUE (organization_id, id),
  CONSTRAINT uq_payslips_run_emp UNIQUE (organization_id, payroll_run_id, employee_id),
  CONSTRAINT fk_payslips_run FOREIGN KEY (organization_id, payroll_run_id)
    REFERENCES public.payroll_runs(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_payslips_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payslips_emp_period 
  ON public.payslips(organization_id, employee_id, period_year, period_month);

-- 2.5 Tax Declarations
CREATE TABLE IF NOT EXISTS public.tax_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  regime VARCHAR(50) NOT NULL DEFAULT 'NEW',
  declared_exemptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_exemptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  verified_by UUID NULL,
  verified_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_tax_declarations_org_id UNIQUE (organization_id, id),
  CONSTRAINT uq_tax_declarations_emp_year UNIQUE (organization_id, employee_id, financial_year),
  CONSTRAINT fk_tax_declarations_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_tax_declarations_verifier FOREIGN KEY (organization_id, verified_by)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_emp 
  ON public.tax_declarations(organization_id, employee_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.approval_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;

-- 3.1 Approval Definitions
DROP POLICY IF EXISTS "approval_definitions_select" ON public.approval_definitions;
CREATE POLICY "approval_definitions_select" ON public.approval_definitions
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "approval_definitions_write" ON public.approval_definitions;
CREATE POLICY "approval_definitions_write" ON public.approval_definitions
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('org:manage')
  );

-- 3.2 Approval Instances
DROP POLICY IF EXISTS "approval_instances_select" ON public.approval_instances;
CREATE POLICY "approval_instances_select" ON public.approval_instances
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      requester_id = public.auth_employee_id()
      OR public.auth_is_manager_of(requester_id)
      OR public.auth_has_permission('approval:view_all')
      OR EXISTS (
        SELECT 1 FROM public.approval_steps s
        WHERE s.instance_id = approval_instances.id
          AND s.organization_id = approval_instances.organization_id
          AND (s.assigned_employee_id = public.auth_employee_id() OR s.actioned_by = public.auth_employee_id())
      )
    )
  );

DROP POLICY IF EXISTS "approval_instances_insert" ON public.approval_instances;
CREATE POLICY "approval_instances_insert" ON public.approval_instances
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      requester_id = public.auth_employee_id()
      OR public.auth_has_permission('approval:submit')
    )
  );

DROP POLICY IF EXISTS "approval_instances_update" ON public.approval_instances;
CREATE POLICY "approval_instances_update" ON public.approval_instances
  FOR UPDATE USING (
    organization_id = public.auth_org_id() AND (
      requester_id = public.auth_employee_id()
      OR public.auth_has_permission('approval:action')
      OR public.auth_has_permission('approval:view_all')
    )
  );

-- 3.3 Approval Steps
DROP POLICY IF EXISTS "approval_steps_select" ON public.approval_steps;
CREATE POLICY "approval_steps_select" ON public.approval_steps
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "approval_steps_write" ON public.approval_steps;
CREATE POLICY "approval_steps_write" ON public.approval_steps
  FOR ALL USING (
    organization_id = public.auth_org_id() AND (
      assigned_employee_id = public.auth_employee_id()
      OR public.auth_has_permission('approval:action')
    )
  );

-- 3.4 Approval Actions
DROP POLICY IF EXISTS "approval_actions_select" ON public.approval_actions;
CREATE POLICY "approval_actions_select" ON public.approval_actions
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "approval_actions_insert" ON public.approval_actions;
CREATE POLICY "approval_actions_insert" ON public.approval_actions
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      actor_employee_id = public.auth_employee_id()
      OR public.auth_has_permission('approval:action')
    )
  );

-- 3.5 Salary Structures
DROP POLICY IF EXISTS "salary_structures_select" ON public.salary_structures;
CREATE POLICY "salary_structures_select" ON public.salary_structures
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('payroll:read:all')
      OR public.auth_has_permission('payroll:admin')
    )
  );

DROP POLICY IF EXISTS "salary_structures_write" ON public.salary_structures;
CREATE POLICY "salary_structures_write" ON public.salary_structures
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('payroll:admin')
  );

-- 3.6 Employee Salaries
DROP POLICY IF EXISTS "employee_salaries_select" ON public.employee_salaries;
CREATE POLICY "employee_salaries_select" ON public.employee_salaries
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('payroll:read:all')
    )
  );

DROP POLICY IF EXISTS "employee_salaries_write" ON public.employee_salaries;
CREATE POLICY "employee_salaries_write" ON public.employee_salaries
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('payroll:admin')
  );

-- 3.7 Payroll Runs
DROP POLICY IF EXISTS "payroll_runs_select" ON public.payroll_runs;
CREATE POLICY "payroll_runs_select" ON public.payroll_runs
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('payroll:read:all')
      OR public.auth_has_permission('payroll:process')
    )
  );

DROP POLICY IF EXISTS "payroll_runs_write" ON public.payroll_runs;
CREATE POLICY "payroll_runs_write" ON public.payroll_runs
  FOR ALL USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('payroll:process')
      OR public.auth_has_permission('payroll:admin')
    )
  );

-- 3.8 Payslips
DROP POLICY IF EXISTS "payslips_select" ON public.payslips;
CREATE POLICY "payslips_select" ON public.payslips
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('payroll:read:all')
    )
  );

DROP POLICY IF EXISTS "payslips_write" ON public.payslips;
CREATE POLICY "payslips_write" ON public.payslips
  FOR ALL USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('payroll:process')
      OR public.auth_has_permission('payroll:admin')
    )
  );

-- 3.9 Tax Declarations
DROP POLICY IF EXISTS "tax_declarations_select" ON public.tax_declarations;
CREATE POLICY "tax_declarations_select" ON public.tax_declarations
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('payroll:read:all')
    )
  );

DROP POLICY IF EXISTS "tax_declarations_insert" ON public.tax_declarations;
CREATE POLICY "tax_declarations_insert" ON public.tax_declarations
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
    )
  );

DROP POLICY IF EXISTS "tax_declarations_update" ON public.tax_declarations;
CREATE POLICY "tax_declarations_update" ON public.tax_declarations
  FOR UPDATE USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('payroll:admin')
    )
  );
