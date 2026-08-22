import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordAuditLog } from './audit-logger';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('recordAuditLog', () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  const mockClient = { from: mockFrom } as unknown as SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts audit log record with state diff and tenant isolation', async () => {
    await recordAuditLog({
      organizationId: 'org-123',
      actorUserId: 'user-123',
      actorEmployeeId: 'emp-123',
      traceId: 'trace-123',
      action: 'leave.request_approved',
      resourceType: 'leave_requests',
      resourceId: 'req-123',
      beforeState: { status: 'PENDING', days: 2 },
      afterState: { status: 'APPROVED', days: 2 },
      client: mockClient,
    });

    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-123',
        actor_user_id: 'user-123',
        actor_employee_id: 'emp-123',
        trace_id: 'trace-123',
        action: 'leave.request_approved',
        resource_type: 'leave_requests',
        resource_id: 'req-123',
        diff: {
          status: { from: 'PENDING', to: 'APPROVED' },
        },
      })
    );
  });
});
