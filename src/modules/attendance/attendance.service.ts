import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/core/errors/app-error';
import { recordAuditLog } from '@/core/audit/audit-logger';
import {
  AttendanceStatus,
  type AttendanceRecord,
  type AttendanceShift,
} from './types';
import type { CheckInSchema, CheckOutSchema, RegularizeAttendanceSchema, CreateShiftSchema } from './schemas';
import type { z } from 'zod';

export class AttendanceService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly auth: AuthContext
  ) {}

  /**
   * Logs a check-in event for the authenticated employee.
   */
  async checkIn(
    input: z.infer<typeof CheckInSchema>,
    traceId: string
  ): Promise<AttendanceRecord> {
    const employeeId = this.auth.employeeId;
    if (!employeeId) {
      throw new ValidationError('Authenticated user is not associated with an employee record');
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Check if record exists for today
    const { data: existing } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();

    if (existing && existing.check_in) {
      throw new ConflictError(`Employee EMP-${employeeId.slice(0, 6)} is already checked in for today (${today})`);
    }

    let record: AttendanceRecord;

    if (existing) {
      const { data, error } = await this.supabase
        .from('attendance_records')
        .update({
          check_in: nowIso,
          status: AttendanceStatus.PRESENT,
          check_in_latitude: input.latitude ?? null,
          check_in_longitude: input.longitude ?? null,
          location_id: input.locationId ?? existing.location_id,
          shift_id: input.shiftId ?? existing.shift_id,
          metadata: input.metadata ?? existing.metadata,
          updated_at: nowIso,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error || !data) {
        throw new AppError(`Failed to update check-in: ${error?.message || 'Unknown error'}`);
      }
      record = data as AttendanceRecord;
    } else {
      const { data, error } = await this.supabase
        .from('attendance_records')
        .insert({
          organization_id: this.auth.organizationId,
          employee_id: employeeId,
          date: today,
          check_in: nowIso,
          status: AttendanceStatus.PRESENT,
          check_in_latitude: input.latitude ?? null,
          check_in_longitude: input.longitude ?? null,
          location_id: input.locationId ?? null,
          shift_id: input.shiftId ?? null,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();

      if (error || !data) {
        throw new AppError(`Failed to record check-in: ${error?.message || 'Unknown error'}`);
      }
      record = data as AttendanceRecord;
    }

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: employeeId,
      traceId,
      action: 'attendance.check_in',
      resourceType: 'attendance_records',
      resourceId: record.id,
      afterState: record as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return record;
  }

  /**
   * Logs a check-out event and calculates duration for today.
   */
  async checkOut(
    input: z.infer<typeof CheckOutSchema>,
    traceId: string
  ): Promise<AttendanceRecord> {
    const employeeId = this.auth.employeeId;
    if (!employeeId) {
      throw new ValidationError('Authenticated user is not associated with an employee record');
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowIso = now.toISOString();

    const { data: existing, error: findError } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();

    if (findError || !existing || !existing.check_in) {
      throw new NotFoundError('Attendance check-in record for today', today);
    }

    const checkInTime = new Date(existing.check_in);
    const durationMinutes = Math.max(0, Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60)));

    const { data, error } = await this.supabase
      .from('attendance_records')
      .update({
        check_out: nowIso,
        work_duration_minutes: durationMinutes,
        check_out_latitude: input.latitude ?? null,
        check_out_longitude: input.longitude ?? null,
        updated_at: nowIso,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to record check-out: ${error?.message || 'Unknown error'}`);
    }

    const record = data as AttendanceRecord;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: employeeId,
      traceId,
      action: 'attendance.check_out',
      resourceType: 'attendance_records',
      resourceId: record.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: record as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return record;
  }

  /**
   * Regularizes an attendance record (Manager or HR Admin).
   */
  async regularize(
    input: z.infer<typeof RegularizeAttendanceSchema>,
    traceId: string
  ): Promise<AttendanceRecord> {
    const { data: existing, error: findError } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.recordId)
      .maybeSingle();

    if (findError || !existing) {
      throw new NotFoundError('Attendance record', input.recordId);
    }

    const nowIso = new Date().toISOString();
    let calculatedDuration = existing.work_duration_minutes;

    const newCheckIn = input.checkIn ?? existing.check_in;
    const newCheckOut = input.checkOut ?? existing.check_out;

    if (newCheckIn && newCheckOut) {
      const inTime = new Date(newCheckIn).getTime();
      const outTime = new Date(newCheckOut).getTime();
      calculatedDuration = Math.max(0, Math.round((outTime - inTime) / (1000 * 60)));
    }

    const { data, error } = await this.supabase
      .from('attendance_records')
      .update({
        check_in: newCheckIn,
        check_out: newCheckOut,
        work_duration_minutes: calculatedDuration,
        status: input.status ?? existing.status,
        is_regularized: true,
        regularization_reason: input.reason,
        regularized_by: this.auth.employeeId,
        regularized_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', input.recordId)
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to regularize attendance: ${error?.message || 'Unknown error'}`);
    }

    const record = data as AttendanceRecord;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'attendance.record_regularized',
      resourceType: 'attendance_records',
      resourceId: record.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: record as unknown as Record<string, unknown>,
      metadata: { reason: input.reason },
      client: this.supabase,
    });

    return record;
  }

  /**
   * Creates a shift configuration.
   */
  async createShift(
    input: z.infer<typeof CreateShiftSchema>,
    traceId: string
  ): Promise<AttendanceShift> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .insert({
        organization_id: this.auth.organizationId,
        name: input.name,
        code: input.code,
        start_time: input.startTime,
        end_time: input.endTime,
        grace_period_minutes: input.gracePeriodMinutes,
        break_duration_minutes: input.breakDurationMinutes,
        work_days: input.workDays,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to create shift: ${error?.message || 'Unknown error'}`);
    }

    const shift = data as AttendanceShift;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'attendance.shift_created',
      resourceType: 'attendance_shifts',
      resourceId: shift.id,
      afterState: shift as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return shift;
  }

  /**
   * Retrieves active shifts for the organization.
   */
  async getShifts(): Promise<AttendanceShift[]> {
    const { data, error } = await this.supabase
      .from('attendance_shifts')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw new AppError(`Failed to load shifts: ${error.message}`);
    }

    return (data || []) as AttendanceShift[];
  }
}
