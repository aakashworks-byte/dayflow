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
  LeaveStatus,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveType,
  type HolidayCalendar,
} from './types';
import type {
  ApplyLeaveSchema,
  ActionLeaveRequestSchema,
  CreateLeaveTypeSchema,
  AllocateLeaveBalanceSchema,
  CreateHolidaySchema,
} from './schemas';
import type { z } from 'zod';

export class LeaveService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly auth: AuthContext
  ) {}

  /**
   * Submits a new leave request and reserves pending balance.
   */
  async applyLeave(
    input: z.infer<typeof ApplyLeaveSchema>,
    traceId: string
  ): Promise<LeaveRequest> {
    const employeeId = this.auth.employeeId;
    if (!employeeId) {
      throw new ValidationError('Authenticated user is not associated with an employee record');
    }

    const currentYear = new Date(input.startDate).getFullYear();

    // 1. Verify leave type exists and is active
    const { data: leaveType, error: typeErr } = await this.supabase
      .from('leave_types')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.leaveTypeId)
      .is('deleted_at', null)
      .maybeSingle();

    if (typeErr || !leaveType) {
      throw new NotFoundError('Leave type', input.leaveTypeId);
    }

    // 2. Fetch employee's current balance
    const { data: balance, error: balErr } = await this.supabase
      .from('leave_balances')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('employee_id', employeeId)
      .eq('leave_type_id', input.leaveTypeId)
      .eq('year', currentYear)
      .maybeSingle();

    if (balErr || !balance) {
      throw new BusinessRuleError(
        `No leave balance allocated for '${leaveType.name}' in year ${currentYear}`
      );
    }

    const availableDays =
      Number(balance.allocated_days) +
      Number(balance.carried_forward_days) -
      Number(balance.used_days) -
      Number(balance.pending_days);

    if (availableDays < input.daysCount) {
      throw new BusinessRuleError(
        `Insufficient leave balance. Available: ${availableDays} days, Requested: ${input.daysCount} days`
      );
    }

    // 3. Create Leave Request
    const { data: request, error: reqErr } = await this.supabase
      .from('leave_requests')
      .insert({
        organization_id: this.auth.organizationId,
        employee_id: employeeId,
        leave_type_id: input.leaveTypeId,
        start_date: input.startDate,
        end_date: input.endDate,
        days_count: input.daysCount,
        reason: input.reason,
        status: LeaveStatus.PENDING,
        document_url: input.documentUrl ?? null,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (reqErr || !request) {
      throw new AppError(`Failed to submit leave request: ${reqErr?.message || 'Unknown error'}`);
    }

    // 4. Update pending days on balance
    await this.supabase
      .from('leave_balances')
      .update({
        pending_days: Number(balance.pending_days) + input.daysCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', balance.id);

    const leaveReq = request as LeaveRequest;

    // 5. Emit Audit Log
    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: employeeId,
      traceId,
      action: 'leave.applied',
      resourceType: 'leave_requests',
      resourceId: leaveReq.id,
      afterState: leaveReq as unknown as Record<string, unknown>,
      metadata: { daysCount: input.daysCount, leaveType: leaveType.code },
      client: this.supabase,
    });

    return leaveReq;
  }

  /**
   * Approves or rejects a pending leave request.
   */
  async actionLeaveRequest(
    input: z.infer<typeof ActionLeaveRequestSchema>,
    traceId: string
  ): Promise<LeaveRequest> {
    const { data: request, error: findErr } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.requestId)
      .maybeSingle();

    if (findErr || !request) {
      throw new NotFoundError('Leave request', input.requestId);
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BusinessRuleError(`Cannot action leave request with status '${request.status}'`);
    }

    const currentYear = new Date(request.start_date).getFullYear();

    // Fetch corresponding balance
    const { data: balance } = await this.supabase
      .from('leave_balances')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('employee_id', request.employee_id)
      .eq('leave_type_id', request.leave_type_id)
      .eq('year', currentYear)
      .maybeSingle();

    const isApprove = input.action === 'APPROVE';
    const newStatus = isApprove ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    const nowIso = new Date().toISOString();

    const { data: updatedRequest, error: updateErr } = await this.supabase
      .from('leave_requests')
      .update({
        status: newStatus,
        approver_id: this.auth.employeeId,
        approver_comments: input.comments ?? null,
        actioned_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', input.requestId)
      .select()
      .single();

    if (updateErr || !updatedRequest) {
      throw new AppError(`Failed to action leave request: ${updateErr?.message || 'Unknown error'}`);
    }

    // Adjust leave balance
    if (balance) {
      const days = Number(request.days_count);
      const newPending = Math.max(0, Number(balance.pending_days) - days);
      const newUsed = isApprove ? Number(balance.used_days) + days : Number(balance.used_days);

      await this.supabase
        .from('leave_balances')
        .update({
          pending_days: newPending,
          used_days: newUsed,
          updated_at: nowIso,
        })
        .eq('id', balance.id);
    }

    const result = updatedRequest as LeaveRequest;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: isApprove ? 'leave.approved' : 'leave.rejected',
      resourceType: 'leave_requests',
      resourceId: result.id,
      beforeState: request as unknown as Record<string, unknown>,
      afterState: result as unknown as Record<string, unknown>,
      metadata: { comments: input.comments },
      client: this.supabase,
    });

    return result;
  }

  /**
   * Creates a new leave type.
   */
  async createLeaveType(
    input: z.infer<typeof CreateLeaveTypeSchema>,
    traceId: string
  ): Promise<LeaveType> {
    const { data, error } = await this.supabase
      .from('leave_types')
      .insert({
        organization_id: this.auth.organizationId,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        days_allowed_per_year: input.daysAllowedPerYear,
        is_carry_forward: input.isCarryForward,
        max_carry_forward_days: input.maxCarryForwardDays,
        is_paid: input.isPaid,
        requires_attachment: input.requiresAttachment,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to create leave type: ${error?.message || 'Unknown error'}`);
    }

    const leaveType = data as LeaveType;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'leave.type_created',
      resourceType: 'leave_types',
      resourceId: leaveType.id,
      afterState: leaveType as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return leaveType;
  }

  /**
   * Allocates or adjusts leave balance for an employee.
   */
  async allocateBalance(
    input: z.infer<typeof AllocateLeaveBalanceSchema>,
    traceId: string
  ): Promise<LeaveBalance> {
    const { data, error } = await this.supabase
      .from('leave_balances')
      .upsert(
        {
          organization_id: this.auth.organizationId,
          employee_id: input.employeeId,
          leave_type_id: input.leaveTypeId,
          year: input.year,
          allocated_days: input.allocatedDays,
          carried_forward_days: input.carriedForwardDays,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,employee_id,leave_type_id,year' }
      )
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to allocate leave balance: ${error?.message || 'Unknown error'}`);
    }

    const balance = data as LeaveBalance;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'leave.balance_adjusted',
      resourceType: 'leave_balances',
      resourceId: balance.id,
      afterState: balance as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return balance;
  }

  /**
   * Creates a holiday calendar entry.
   */
  async createHoliday(
    input: z.infer<typeof CreateHolidaySchema>,
    traceId: string
  ): Promise<HolidayCalendar> {
    const year = new Date(input.date).getFullYear();

    const { data, error } = await this.supabase
      .from('holiday_calendars')
      .insert({
        organization_id: this.auth.organizationId,
        location_id: input.locationId ?? null,
        name: input.name,
        date: input.date,
        year,
        is_optional: input.isOptional,
        description: input.description ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to create holiday: ${error?.message || 'Unknown error'}`);
    }

    const holiday = data as HolidayCalendar;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'leave.holiday_created',
      resourceType: 'holiday_calendars',
      resourceId: holiday.id,
      afterState: holiday as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return holiday;
  }
}
