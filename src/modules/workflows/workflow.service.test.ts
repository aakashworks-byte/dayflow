import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowService } from './workflow.service';
import { ApprovalStatus, StepStatus, WorkflowActionType } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';

describe('WorkflowService', () => {
  const mockAuth: AuthContext = {
    userId: 'user-111',
    employeeId: 'emp-222',
    organizationId: 'org-333',
    roles: ['HR_ADMIN'],
    permissions: ['approval:submit', 'approval:action'],
  };

  const mockSupabase = {
    from: vi.fn(),
  };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowService(mockSupabase as unknown as SupabaseClient, mockAuth);
  });

  it('submits a workflow instance and generates all ordered approval steps', async () => {
    const mockDef = {
      id: 'def-123',
      code: 'EXPENSE_APPROVAL',
      steps_config: [
        { step_order: 1, name: 'Line Manager Review', approver_type: 'MANAGER' },
        { step_order: 2, name: 'Finance Review', approver_type: 'ROLE', approver_role_code: 'FINANCE_ADMIN' },
      ],
    };

    const mockRequester = {
      id: 'emp-222',
      manager_id: 'emp-manager-999',
    };

    const mockInstance = {
      id: 'inst-123',
      organization_id: 'org-333',
      definition_id: 'def-123',
      requester_id: 'emp-222',
      entity_type: 'expense_claim',
      entity_id: 'claim-100',
      current_step_order: 1,
      total_steps: 2,
      status: ApprovalStatus.IN_PROGRESS,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'approval_definitions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockDef, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'employees') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockRequester, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'approval_instances') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInstance, error: null }),
            }),
          }),
        };
      }
      if (table === 'approval_steps') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await service.submitInstance(
      {
        definitionCode: 'EXPENSE_APPROVAL',
        entityType: 'expense_claim',
        entityId: 'claim-100',
      },
      'trace-wf-123'
    );

    expect(result.id).toBe('inst-123');
    expect(result.status).toBe(ApprovalStatus.IN_PROGRESS);
    expect(result.total_steps).toBe(2);
  });

  it('approves a step and marks the workflow instance completed on the final step', async () => {
    const mockInstance = {
      id: 'inst-123',
      organization_id: 'org-333',
      current_step_order: 1,
      total_steps: 1,
      status: ApprovalStatus.IN_PROGRESS,
    };

    const mockStep = {
      id: 'step-123',
      instance_id: 'inst-123',
      step_order: 1,
      name: 'Manager Approval',
      status: StepStatus.PENDING,
    };

    const mockApprovedInstance = {
      ...mockInstance,
      status: ApprovalStatus.APPROVED,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'approval_instances') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockInstance, error: null }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockApprovedInstance, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'approval_steps') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockStep, error: null }),
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'approval_actions') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await service.actionStep(
      {
        instanceId: 'inst-123',
        action: WorkflowActionType.APPROVE,
        comments: 'Looks good',
      },
      'trace-action-123'
    );

    expect(result.status).toBe(ApprovalStatus.APPROVED);
  });
});
