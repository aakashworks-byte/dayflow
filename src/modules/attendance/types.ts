export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  ON_LEAVE: 'ON_LEAVE',
  HOLIDAY: 'HOLIDAY',
  WEEKEND: 'WEEKEND',
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface AttendanceShift {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  break_duration_minutes: number;
  work_days: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BiometricDevice {
  id: string;
  organization_id: string;
  location_id: string;
  device_name: string;
  device_code: string;
  ip_address?: string | null;
  status: string;
  last_heartbeat_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  shift_id?: string | null;
  location_id?: string | null;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: AttendanceStatus;
  work_duration_minutes?: number | null;
  is_regularized: boolean;
  regularization_reason?: string | null;
  regularized_by?: string | null;
  regularized_at?: string | null;
  check_in_latitude?: number | null;
  check_in_longitude?: number | null;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
