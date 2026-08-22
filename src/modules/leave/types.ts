export const LeaveStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

export interface LeaveType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string | null;
  days_allowed_per_year: number;
  is_carry_forward: boolean;
  max_carry_forward_days: number;
  is_paid: boolean;
  requires_attachment: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LeaveBalance {
  id: string;
  organization_id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  carried_forward_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  organization_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  approver_id?: string | null;
  approver_comments?: string | null;
  actioned_at?: string | null;
  document_url?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HolidayCalendar {
  id: string;
  organization_id: string;
  location_id?: string | null;
  name: string;
  date: string;
  year: number;
  is_optional: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
