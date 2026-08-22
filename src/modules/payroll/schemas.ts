import { z } from 'zod';
import { SalaryComponentType } from './types';

export const SalaryComponentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/),
  type: z.enum([SalaryComponentType.EARNING, SalaryComponentType.DEDUCTION]),
  percentage_of_base: z.number().min(0).max(100).optional(),
  fixed_amount: z.number().min(0).optional(),
  is_taxable: z.boolean().default(true),
});

export const CreateSalaryStructureSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default('USD'),
  components: z.array(SalaryComponentSchema).min(1, 'At least one salary component required'),
});

export const AssignEmployeeSalarySchema = z.object({
  employeeId: z.string().uuid('Valid employeeId UUID required'),
  salaryStructureId: z.string().uuid('Valid salaryStructureId UUID required'),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required'),
  annualCtc: z.number().positive('annualCtc must be positive'),
});

export const InitiatePayrollRunSchema = z.object({
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2000).max(2100),
  departmentId: z.string().uuid().optional(),
});

export const FinalizePayrollRunSchema = z.object({
  payrollRunId: z.string().uuid('Valid payrollRunId UUID required'),
});

export const SubmitTaxDeclarationSchema = z.object({
  financialYear: z.string().regex(/^\d{4}-\d{4}$/, 'Format must be YYYY-YYYY (e.g. 2026-2027)'),
  regime: z.enum(['NEW', 'OLD']).default('NEW'),
  declaredExemptions: z.record(z.string(), z.number().min(0)),
});

export const QueryPayrollRunsSchema = z.object({
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().optional(),
  departmentId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
