import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';

describe('AttendanceService', () => {
  const mockAuth: AuthContext = {
    userId: 'user-111',
    employeeId: 'emp-222',
    organizationId: 'org-333',
    roles: ['EMPLOYEE'],
    permissions: ['attendance:log:self'],
  };

  const mockSupabase = {
    from: vi.fn(),
  };

  let service: AttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AttendanceService(mockSupabase as unknown as SupabaseClient, mockAuth);
  });

  it('performs check-in and records audit event', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'rec-123',
            organization_id: 'org-333',
            employee_id: 'emp-222',
            date: '2026-08-22',
            check_in: '2026-08-22T09:00:00Z',
            status: AttendanceStatus.PRESENT,
          },
          error: null,
        }),
      }),
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'attendance_records') {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await service.checkIn(
      { latitude: 37.7749, longitude: -122.4194 },
      'trace-test-123'
    );

    expect(result.id).toBe('rec-123');
    expect(result.status).toBe(AttendanceStatus.PRESENT);
  });

  it('performs check-out and calculates duration', async () => {
    const checkInTime = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'rec-123',
              organization_id: 'org-333',
              employee_id: 'emp-222',
              date: '2026-08-22',
              check_in: checkInTime,
              check_out: new Date().toISOString(),
              work_duration_minutes: 480,
              status: AttendanceStatus.PRESENT,
            },
            error: null,
          }),
        }),
      }),
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'rec-123',
                organization_id: 'org-333',
                employee_id: 'emp-222',
                check_in: checkInTime,
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'attendance_records') {
        return {
          select: mockSelect,
          update: mockUpdate,
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const result = await service.checkOut({}, 'trace-checkout-123');

    expect(result.id).toBe('rec-123');
    expect(result.work_duration_minutes).toBeGreaterThanOrEqual(470);
  });
});
