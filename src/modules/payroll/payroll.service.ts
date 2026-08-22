import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';
import {
  AppError,
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '@/core/errors/app-error';
import { recordAuditLog } from '@/core/audit/audit-logger';
import {
  PayrollRunStatus,
  type SalaryStructure,
  type EmployeeSalary,
  type PayrollRun,
  type TaxDeclaration,
} from './types';
import type {
  CreateSalaryStructureSchema,
  AssignEmployeeSalarySchema,
  InitiatePayrollRunSchema,
  FinalizePayrollRunSchema,
  SubmitTaxDeclarationSchema,
} from './schemas';
import type { z } from 'zod';
import type { Json } from '@/types/database.types';

export class PayrollService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly auth: AuthContext
  ) {}

  /**
   * Creates a master salary structure with earnings and deductions.
   */
  async createSalaryStructure(
    input: z.infer<typeof CreateSalaryStructureSchema>,
    traceId: string
  ): Promise<SalaryStructure> {
    const { data, error } = await this.supabase
      .from('salary_structures')
      .insert({
        organization_id: this.auth.organizationId,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        currency: input.currency,
        components: input.components as unknown as Json,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to create salary structure: ${error?.message || 'Unknown error'}`);
    }

    const structure = data as unknown as SalaryStructure;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'payroll.structure_created',
      resourceType: 'salary_structures',
      resourceId: structure.id,
      afterState: structure as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return structure;
  }

  /**
   * Assigns compensation and salary structure to an employee.
   */
  async assignSalary(
    input: z.infer<typeof AssignEmployeeSalarySchema>,
    traceId: string
  ): Promise<EmployeeSalary> {
    // 1. Verify Structure exists
    const { data: structure, error: structErr } = await this.supabase
      .from('salary_structures')
      .select('id')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.salaryStructureId)
      .is('deleted_at', null)
      .maybeSingle();

    if (structErr || !structure) {
      throw new NotFoundError('Salary structure', input.salaryStructureId);
    }

    // 2. Verify Employee exists
    const { data: employee, error: empErr } = await this.supabase
      .from('employees')
      .select('id')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.employeeId)
      .maybeSingle();

    if (empErr || !employee) {
      throw new NotFoundError('Employee', input.employeeId);
    }

    const monthlyGross = Math.round((input.annualCtc / 12) * 100) / 100;

    // Deactivate existing active salary
    await this.supabase
      .from('employee_salaries')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('organization_id', this.auth.organizationId)
      .eq('employee_id', input.employeeId)
      .eq('is_active', true);

    // Insert new active salary
    const { data, error } = await this.supabase
      .from('employee_salaries')
      .insert({
        organization_id: this.auth.organizationId,
        employee_id: input.employeeId,
        salary_structure_id: input.salaryStructureId,
        effective_from: input.effectiveFrom,
        annual_ctc: input.annualCtc,
        monthly_gross: monthlyGross,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to assign salary: ${error?.message || 'Unknown error'}`);
    }

    const salary = data as EmployeeSalary;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'payroll.salary_updated',
      resourceType: 'employee_salaries',
      resourceId: salary.id,
      afterState: salary as unknown as Record<string, unknown>,
      metadata: { annualCtc: input.annualCtc, monthlyGross },
      client: this.supabase,
    });

    return salary;
  }

  /**
   * Initiates and computes a payroll run for all active employees.
   */
  async initiatePayrollRun(
    input: z.infer<typeof InitiatePayrollRunSchema>,
    traceId: string
  ): Promise<PayrollRun> {
    // 1. Create Initial Run
    const { data: run, error: runErr } = await this.supabase
      .from('payroll_runs')
      .insert({
        organization_id: this.auth.organizationId,
        department_id: input.departmentId ?? null,
        period_month: input.periodMonth,
        period_year: input.periodYear,
        status: PayrollRunStatus.DRAFT,
        processed_by: this.auth.employeeId,
      })
      .select()
      .single();

    if (runErr || !run) {
      throw new AppError(`Failed to initialize payroll run: ${runErr?.message || 'Unknown error'}`);
    }

    // 2. Fetch Active Salaries
    const salaryQuery = this.supabase
      .from('employee_salaries')
      .select('*, employee:employees(id, department_id), structure:salary_structures(*)')
      .eq('organization_id', this.auth.organizationId)
      .eq('is_active', true);

    const { data: activeSalaries, error: salErr } = await salaryQuery;
    if (salErr) {
      throw new AppError(`Failed to fetch active salaries: ${salErr.message}`);
    }

    const filteredSalaries = (activeSalaries || []).filter((s) => {
      if (input.departmentId && s.employee?.department_id !== input.departmentId) {
        return false;
      }
      return true;
    });

    if (filteredSalaries.length === 0) {
      throw new BusinessRuleError('No active employee salaries found for this payroll run scope');
    }

    // 3. Compute Payslips
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const payslipsPayload = filteredSalaries.map((sal) => {
      const gross = Number(sal.monthly_gross);
      const components = (sal.structure?.components || []) as Array<{
        name: string;
        code: string;
        type: 'EARNING' | 'DEDUCTION';
        percentage_of_base?: number;
        fixed_amount?: number;
      }>;

      const breakdown: Record<string, number> = {};
      let deductions = 0;

      for (const comp of components) {
        let amount = 0;
        if (comp.percentage_of_base !== undefined) {
          amount = Math.round(((gross * comp.percentage_of_base) / 100) * 100) / 100;
        } else if (comp.fixed_amount !== undefined) {
          amount = comp.fixed_amount;
        }

        breakdown[comp.code] = amount;
        if (comp.type === 'DEDUCTION') {
          deductions += amount;
        }
      }

      const net = Math.max(0, gross - deductions);

      totalGross += gross;
      totalDeductions += deductions;
      totalNet += net;

      return {
        organization_id: this.auth.organizationId,
        payroll_run_id: run.id,
        employee_id: sal.employee_id,
        period_month: input.periodMonth,
        period_year: input.periodYear,
        gross_pay: gross,
        total_deductions: deductions,
        net_pay: net,
        breakdown: breakdown as unknown as Json,
        payment_status: 'UNPAID',
      };
    });

    // 4. Batch insert payslips
    const { error: slipErr } = await this.supabase
      .from('payslips')
      .insert(payslipsPayload);

    if (slipErr) {
      throw new AppError(`Failed to generate payslips: ${slipErr.message}`);
    }

    // 5. Update Run Totals and Status
    const { data: updatedRun } = await this.supabase
      .from('payroll_runs')
      .update({
        status: PayrollRunStatus.COMPUTED,
        total_gross_amount: Math.round(totalGross * 100) / 100,
        total_deductions_amount: Math.round(totalDeductions * 100) / 100,
        total_net_amount: Math.round(totalNet * 100) / 100,
        total_employees_count: filteredSalaries.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id)
      .select()
      .single();

    const payrollRun = updatedRun as PayrollRun;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'payroll.run_initiated',
      resourceType: 'payroll_runs',
      resourceId: payrollRun.id,
      afterState: payrollRun as unknown as Record<string, unknown>,
      metadata: {
        periodMonth: input.periodMonth,
        periodYear: input.periodYear,
        totalEmployees: filteredSalaries.length,
      },
      client: this.supabase,
    });

    return payrollRun;
  }

  /**
   * Finalizes a computed payroll run.
   */
  async finalizePayrollRun(
    input: z.infer<typeof FinalizePayrollRunSchema>,
    traceId: string
  ): Promise<PayrollRun> {
    const { data: run, error: findErr } = await this.supabase
      .from('payroll_runs')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.payrollRunId)
      .maybeSingle();

    if (findErr || !run) {
      throw new NotFoundError('Payroll run', input.payrollRunId);
    }

    if (run.status !== PayrollRunStatus.COMPUTED) {
      throw new BusinessRuleError(`Cannot finalize payroll run with status '${run.status}'`);
    }

    const nowIso = new Date().toISOString();

    const { data: updatedRun, error: updateErr } = await this.supabase
      .from('payroll_runs')
      .update({
        status: PayrollRunStatus.FINALIZED,
        finalized_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', input.payrollRunId)
      .select()
      .single();

    if (updateErr || !updatedRun) {
      throw new AppError(`Failed to finalize payroll run: ${updateErr?.message || 'Unknown error'}`);
    }

    const result = updatedRun as PayrollRun;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'payroll.run_finalized',
      resourceType: 'payroll_runs',
      resourceId: result.id,
      beforeState: run as unknown as Record<string, unknown>,
      afterState: result as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return result;
  }

  /**
   * Submits tax regime and exemption declarations.
   */
  async submitTaxDeclaration(
    input: z.infer<typeof SubmitTaxDeclarationSchema>,
    traceId: string
  ): Promise<TaxDeclaration> {
    const employeeId = this.auth.employeeId;
    if (!employeeId) {
      throw new ValidationError('Authenticated user is not associated with an employee record');
    }

    const { data, error } = await this.supabase
      .from('tax_declarations')
      .upsert(
        {
          organization_id: this.auth.organizationId,
          employee_id: employeeId,
          financial_year: input.financialYear,
          regime: input.regime,
          declared_exemptions: input.declaredExemptions as unknown as Json,
          status: 'SUBMITTED',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,employee_id,financial_year' }
      )
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to submit tax declaration: ${error?.message || 'Unknown error'}`);
    }

    const declaration = data as unknown as TaxDeclaration;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: employeeId,
      traceId,
      action: 'payroll.tax_declaration_submitted',
      resourceType: 'tax_declarations',
      resourceId: declaration.id,
      afterState: declaration as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return declaration;
  }
}
