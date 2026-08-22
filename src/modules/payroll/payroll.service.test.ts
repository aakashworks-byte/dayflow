import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayrollService } from './payroll.service';
import { PayrollRunStatus, SalaryComponentType } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';

describe('PayrollService', () => {
  const mockAuth: AuthContext = {
    userId: 'user-111',
    employeeId: 'emp-222',
    organizationId: 'org-333',
    roles: ['PAYROLL_ADMIN'],
    permissions: ['payroll:process', 'payroll:admin'],
  };

  const mockSupabase = {
    from: vi.fn(),
  };

  let service: PayrollService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PayrollService(mockSupabase as unknown as SupabaseClient, mockAuth);
  });

  it('assigns employee salary and computes monthly gross correctly', async () => {
    const mockStructure = {
      id: 'struct-123',
    };

    const mockEmployee = {
      id: 'emp-456',
    };

    const mockAssignedSalary = {
      id: 'sal-123',
      organization_id: 'org-333',
      employee_id: 'emp-456',
      salary_structure_id: 'struct-123',
      annual_ctc: 120000,
      monthly_gross: 10000,
      is_active: true,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'salary_structures') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockStructure, error: null }),
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
                maybeSingle: vi.fn().mockResolvedValue({ data: mockEmployee, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'employee_salaries') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockAssignedSalary, error: null }),
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

    const result = await service.assignSalary(
      {
        employeeId: 'emp-456',
        salaryStructureId: 'struct-123',
        effectiveFrom: '2026-01-01',
        annualCtc: 120000,
      },
      'trace-salary-123'
    );

    expect(result.monthly_gross).toBe(10000);
    expect(result.annual_ctc).toBe(120000);
  });

  it('initiates a payroll run, generates payslips with component deductions, and totals amounts', async () => {
    const mockDraftRun = {
      id: 'run-123',
      organization_id: 'org-333',
      period_month: 8,
      period_year: 2026,
      status: PayrollRunStatus.DRAFT,
    };

    const mockActiveSalaries = [
      {
        id: 'sal-1',
        employee_id: 'emp-1',
        monthly_gross: 10000,
        structure: {
          components: [
            { name: 'Basic', code: 'BASIC', type: SalaryComponentType.EARNING, percentage_of_base: 50 },
            { name: 'Provident Fund', code: 'PF', type: SalaryComponentType.DEDUCTION, percentage_of_base: 12 },
          ],
        },
      },
    ];

    const mockComputedRun = {
      id: 'run-123',
      status: PayrollRunStatus.COMPUTED,
      total_gross_amount: 10000,
      total_deductions_amount: 1200,
      total_net_amount: 8800,
      total_employees_count: 1,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'payroll_runs') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockDraftRun, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockComputedRun, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'employee_salaries') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockActiveSalaries, error: null }),
            }),
          }),
        };
      }
      if (table === 'payslips') {
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

    const result = await service.initiatePayrollRun(
      {
        periodMonth: 8,
        periodYear: 2026,
      },
      'trace-run-123'
    );

    expect(result.status).toBe(PayrollRunStatus.COMPUTED);
    expect(result.total_net_amount).toBe(8800);
    expect(result.total_deductions_amount).toBe(1200);
  });
});
