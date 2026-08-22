-- Migration 00010: Policy Engine
-- Purpose: Schema, composite foreign keys, indexes, and RLS policies for Policy Engine.

-- ============================================================================
-- 1. POLICIES SCHEMA
-- ============================================================================

-- 1.1 Policies
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  domain VARCHAR(50) NOT NULL DEFAULT 'LEAVE',
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_policies_org_id UNIQUE (organization_id, id),
  CONSTRAINT chk_policies_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_org_code_version 
  ON public.policies(organization_id, code, version) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_policies_org_domain 
  ON public.policies(organization_id, domain, is_active) 
  WHERE deleted_at IS NULL;

-- 1.2 Policy Rules
CREATE TABLE IF NOT EXISTS public.policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL,
  rule_type VARCHAR(100) NOT NULL,
  rule_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity VARCHAR(50) NOT NULL DEFAULT 'BLOCKING', -- 'BLOCKING', 'WARNING', 'INFO'
  evaluation_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_policy_rules_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_policy_rules_policy FOREIGN KEY (organization_id, policy_id)
    REFERENCES public.policies(organization_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_policy_rules_policy 
  ON public.policy_rules(organization_id, policy_id, evaluation_order) 
  WHERE deleted_at IS NULL;

-- 1.3 Policy Evaluations
CREATE TABLE IF NOT EXISTS public.policy_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL,
  policy_version INTEGER NOT NULL DEFAULT 1,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  employee_id UUID NOT NULL,
  overall_result VARCHAR(50) NOT NULL, -- 'APPROVE', 'REJECT', 'POLICY_CONFLICT', 'INSUFFICIENT_DATA'
  recommendation TEXT NOT NULL,
  evaluated_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluated_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_policy_evaluations_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_policy_evaluations_policy FOREIGN KEY (organization_id, policy_id)
    REFERENCES public.policies(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_policy_evaluations_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_policy_evaluations_evaluator FOREIGN KEY (organization_id, evaluated_by)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_policy_evaluations_entity 
  ON public.policy_evaluations(organization_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_policy_evaluations_employee 
  ON public.policy_evaluations(organization_id, employee_id, created_at DESC);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_evaluations ENABLE ROW LEVEL SECURITY;

-- 2.1 Policies RLS
DROP POLICY IF EXISTS "policies_select" ON public.policies;
CREATE POLICY "policies_select" ON public.policies
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('policy:read')
      OR public.auth_has_permission('policy:manage')
    )
  );

DROP POLICY IF EXISTS "policies_write" ON public.policies;
CREATE POLICY "policies_write" ON public.policies
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('policy:manage')
  );

-- 2.2 Policy Rules RLS
DROP POLICY IF EXISTS "policy_rules_select" ON public.policy_rules;
CREATE POLICY "policy_rules_select" ON public.policy_rules
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      public.auth_has_permission('policy:read')
      OR public.auth_has_permission('policy:manage')
    )
  );

DROP POLICY IF EXISTS "policy_rules_write" ON public.policy_rules;
CREATE POLICY "policy_rules_write" ON public.policy_rules
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('policy:manage')
  );

-- 2.3 Policy Evaluations RLS
DROP POLICY IF EXISTS "policy_evaluations_select" ON public.policy_evaluations;
CREATE POLICY "policy_evaluations_select" ON public.policy_evaluations
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('policy:read')
      OR public.auth_has_permission('policy:evaluate')
    )
  );

DROP POLICY IF EXISTS "policy_evaluations_insert" ON public.policy_evaluations;
CREATE POLICY "policy_evaluations_insert" ON public.policy_evaluations
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('policy:evaluate')
      OR public.auth_has_permission('policy:manage')
    )
  );
