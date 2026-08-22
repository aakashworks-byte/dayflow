export type Role = 'SUPER_ADMIN' | 'HR_ADMIN' | 'HR_MANAGER' | 'LINE_MANAGER' | 'EMPLOYEE' | 'PAYROLL_ADMIN';

export type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN';

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  display_name: string;
  work_email: string;
  personal_email?: string;
  phone?: string;
  avatar_url?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
  joining_date: string;
  department_id: string;
  department_name: string;
  job_profile_id: string;
  job_title: string;
  location_id: string;
  location_name: string;
  manager_id?: string | null;
  manager_name?: string | null;
  employment_status: EmploymentStatus;
  employment_type: EmploymentType;
  timezone: string;
  role: Role;
  bio?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: EmployeeDocument[];
  salary_structure?: SalaryStructure;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'DOC';
  category: 'Offer Letter' | 'ID Proof' | 'Resume' | 'Certificate' | 'Tax Form';
  size_kb: number;
  uploaded_at: string;
  file_url: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string; // YYYY-MM-DD
  check_in: string | null; // ISO string
  check_out: string | null; // ISO string
  duration_hours: number;
  status: AttendanceStatus;
  notes?: string;
  is_regularized?: boolean;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'PRIVILEGE' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveBalance {
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  privilege: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department_name: string;
  avatar_url?: string;
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  is_half_day?: boolean;
  reason: string;
  status: LeaveStatus;
  applied_at: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  approver_remarks?: string;
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  special_allowance: number;
  conveyance_allowance: number;
  medical_allowance: number;
  gross_earnings: number;
  provident_fund: number;
  professional_tax: number;
  income_tax_tds: number;
  total_deductions: number;
  net_salary: number;
  currency: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department_name: string;
  designation: string;
  month: string; // e.g., "August 2026"
  month_number: number;
  year: number;
  pay_period: string;
  payment_date: string;
  bank_name: string;
  account_number_masked: string;
  pan_masked: string;
  uan_number: string;
  working_days: number;
  paid_days: number;
  leave_days: number;
  structure: SalaryStructure;
  status: 'PAID' | 'PROCESSING' | 'PENDING';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'ANNOUNCEMENT' | 'SYSTEM';
  action_url?: string;
}

export interface ActivityFeedItem {
  id: string;
  actor_name: string;
  actor_avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'PROFILE';
}
