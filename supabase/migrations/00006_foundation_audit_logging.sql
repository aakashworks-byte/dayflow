-- Migration 00006: Immutable Audit Logging Engine
-- Purpose: Tamper-evident, append-only audit trail capturing all domain state changes.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  actor_employee_id UUID NULL REFERENCES public.employees(id) ON DELETE SET NULL,
  trace_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  before_state JSONB NULL,
  after_state JSONB NULL,
  diff JSONB NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log Query Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time 
  ON public.audit_logs(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource 
  ON public.audit_logs(organization_id, resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_trace 
  ON public.audit_logs(trace_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user 
  ON public.audit_logs(actor_user_id);

-- Enforce Strict Immutability (Append-Only)
CREATE OR REPLACE FUNCTION public.prevent_audit_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit records are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_mutation();
