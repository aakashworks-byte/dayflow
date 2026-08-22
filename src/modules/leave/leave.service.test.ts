import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveService } from './leave.service';
import { LeaveStatus } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';

describe('LeaveService', () => {
  const mockAuth: AuthContext = {
    userId: 'user-111',
    employeeId: 'emp-222',
    organizationId: 'org-333',
    roles: ['EMPLOYEE'],
    permissions: ['leave:apply:self', 'leave:approve'],
  };

  const mockSupabase = {
    from: vi.fn(),
  };

  let service: LeaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LeaveService(mockSupabase as unknown as SupabaseClient, mockAuth);
  });

  it('submits leave request when balance is sufficient', async () => {
    const mockLeaveType = {
      id: 'type-123',
      name: 'Annual Leave',
      code: 'ANNUAL',
    };

    const mockBalance = {
      id: 'bal-123',
      allocated_days: 20,
      carried_forward_days: 0,
      used_days: 2,
      pending_days: 0,
    };

    const mockRequest = {
      id: 'req-123',
      organization_id: 'org-333',
      employee_id: 'emp-222',
      leave_type_id: 'type-123',
      start_date: '2026-09-01',
      end_date: '2026-09-03',
      days_count: 3,
      status: LeaveStatus.PENDING,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'leave_types') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockLeaveType, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'leave_balances') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockBalance, error: null }),
                  }),
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'leave_requests') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockRequest, error: null }),
            }),
          }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await service.applyLeave(
      {
        leaveTypeId: 'type-123',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        daysCount: 3,
        reason: 'Family vacation',
      },
      'trace-leave-123'
    );

    expect(result.id).toBe('req-123');
    expect(result.status).toBe(LeaveStatus.PENDING);
    expect(result.days_count).toBe(3);
  });

  it('rejects leave application when balance is insufficient', async () => {
    const mockLeaveType = {
      id: 'type-123',
      name: 'Casual Leave',
      code: 'CASUAL',
    };

    const mockBalance = {
      id: 'bal-123',
      allocated_days: 5,
      carried_forward_days: 0,
      used_days: 4,
      pending_days: 0,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'leave_types') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockLeaveType, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'leave_balances') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: mockBalance, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    await expect(
      service.applyLeave(
        {
          leaveTypeId: 'type-123',
          startDate: '2026-09-01',
          endDate: '2026-09-05',
          daysCount: 5,
          reason: 'Need 5 days',
        },
        'trace-insufficient-123'
      )
    ).rejects.toThrow(/Insufficient leave balance/);
  });
});
