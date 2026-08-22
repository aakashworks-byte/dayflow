export const PayrollRunStatus = {
  DRAFT: 'DRAFT',
  COMPUTED: 'COMPUTED',
  FINALIZED: 'FINALIZED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type PayrollRunStatus = (typeof PayrollRunStatus)[keyof typeof PayrollRunStatus];

export const SalaryComponentType = {
  EARNING: 'EARNING',
  DEDUCTION: 'DEDUCTION',
} as const;

export type SalaryComponentType = (typeof SalaryComponentType)[keyof typeof SalaryComponentType];

export interface SalaryComponent {
  name: string;
  code: string;
  type: SalaryComponentType;
  percentage_of_base?: number;
  fixed_amount?: number;
  is_taxable: boolean;
}

export interface SalaryStructure {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string | null;
  currency: string;
  components: SalaryComponent[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface EmployeeSalary {
  id: string;
  organization_id: string;
  employee_id: string;
  salary_structure_id: string;
  effective_from: string;
  effective_to?: string | null;
  annual_ctc: number;
  monthly_gross: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: string;
  organization_id: string;
  department_id?: string | null;
  period_month: number;
  period_year: number;
  status: PayrollRunStatus;
  total_gross_amount: number;
  total_deductions_amount: number;
  total_net_amount: number;
  total_employees_count: number;
  processed_by?: string | null;
  finalized_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  organization_id: string;
  payroll_run_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  breakdown: Record<string, unknown>;
  payment_status: 'UNPAID' | 'PAID';
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxDeclaration {
  id: string;
  organization_id: string;
  employee_id: string;
  financial_year: string;
  regime: 'NEW' | 'OLD';
  declared_exemptions: Record<string, unknown>;
  verified_exemptions: Record<string, unknown>;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}
