import { createSupabaseServerClient } from '@/config/supabase-server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Json } from '@/types/database.types';

export interface RecordAuditLogParams {
  organizationId: string;
  actorUserId?: string | null;
  actorEmployeeId?: string | null;
  traceId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  diff?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  client?: SupabaseClient;
}

/**
 * Calculates a shallow key-level difference between before and after states.
 */
function calculateStateDiff(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
): Record<string, { from: unknown; to: unknown }> | null {
  if (!before && !after) return null;
  if (!before) return { __created: { from: null, to: after } };
  if (!after) return { __deleted: { from: before, to: null } };

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const valBefore = before[key];
    const valAfter = after[key];

    if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
      diff[key] = { from: valBefore, to: valAfter };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Records an immutable audit log entry into `public.audit_logs`.
 * Complies with PostgreSQL row-level security and multi-tenant isolation.
 */
export async function recordAuditLog(params: RecordAuditLogParams): Promise<void> {
  const supabase = params.client ?? (await createSupabaseServerClient());

  const computedDiff =
    params.diff ?? calculateStateDiff(params.beforeState, params.afterState);

  const payload = {
    organization_id: params.organizationId,
    actor_user_id: params.actorUserId ?? null,
    actor_employee_id: params.actorEmployeeId ?? null,
    trace_id: params.traceId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    before_state: (params.beforeState as Json) ?? null,
    after_state: (params.afterState as Json) ?? null,
    diff: (computedDiff as unknown as Json) ?? null,
    metadata: (params.metadata as Json) ?? {},
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  };

  const { error } = await supabase.from('audit_logs').insert(payload);

  if (error) {
    console.error('[AuditLogger] Failed to write audit log entry:', error.message, {
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      traceId: params.traceId,
    });
  }
}
