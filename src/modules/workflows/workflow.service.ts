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
  ApprovalStatus,
  StepStatus,
  WorkflowActionType,
  type ApprovalDefinition,
  type ApprovalInstance,
  type StepConfig,
} from './types';
import type {
  CreateWorkflowDefinitionSchema,
  SubmitWorkflowInstanceSchema,
  ActionWorkflowStepSchema,
} from './schemas';
import type { z } from 'zod';
import type { Json } from '@/types/database.types';

export class WorkflowService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly auth: AuthContext
  ) {}

  /**
   * Creates an approval workflow definition.
   */
  async createDefinition(
    input: z.infer<typeof CreateWorkflowDefinitionSchema>,
    traceId: string
  ): Promise<ApprovalDefinition> {
    const { data, error } = await this.supabase
      .from('approval_definitions')
      .insert({
        organization_id: this.auth.organizationId,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
        entity_type: input.entityType,
        steps_config: input.stepsConfig as unknown as Json,
      })
      .select()
      .single();

    if (error || !data) {
      throw new AppError(`Failed to create workflow definition: ${error?.message || 'Unknown error'}`);
    }

    const definition = data as unknown as ApprovalDefinition;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'approval.definition_created',
      resourceType: 'approval_definitions',
      resourceId: definition.id,
      afterState: definition as unknown as Record<string, unknown>,
      client: this.supabase,
    });

    return definition;
  }

  /**
   * Submits a workflow instance for an entity and initializes all steps.
   */
  async submitInstance(
    input: z.infer<typeof SubmitWorkflowInstanceSchema>,
    traceId: string
  ): Promise<ApprovalInstance> {
    const requesterId = this.auth.employeeId;
    if (!requesterId) {
      throw new ValidationError('Authenticated user is not associated with an employee record');
    }

    // 1. Fetch Definition
    const { data: definition, error: defErr } = await this.supabase
      .from('approval_definitions')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('code', input.definitionCode)
      .is('deleted_at', null)
      .maybeSingle();

    if (defErr || !definition) {
      throw new NotFoundError('Workflow definition', input.definitionCode);
    }

    const stepsConfig = (definition.steps_config || []) as StepConfig[];
    if (stepsConfig.length === 0) {
      throw new BusinessRuleError(`Workflow '${definition.code}' has no configured steps`);
    }

    // 2. Fetch requester employee to resolve manager if needed
    const { data: requester } = await this.supabase
      .from('employees')
      .select('id, manager_id')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', requesterId)
      .maybeSingle();

    // 3. Create Instance
    const { data: instance, error: instErr } = await this.supabase
      .from('approval_instances')
      .insert({
        organization_id: this.auth.organizationId,
        definition_id: definition.id,
        requester_id: requesterId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        current_step_order: 1,
        total_steps: stepsConfig.length,
        status: ApprovalStatus.IN_PROGRESS,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (instErr || !instance) {
      throw new AppError(`Failed to submit workflow instance: ${instErr?.message || 'Unknown error'}`);
    }

    // 4. Create all Steps
    const stepsPayload = stepsConfig.map((step) => {
      let assignedEmpId: string | null = null;
      if (step.approver_type === 'MANAGER') {
        assignedEmpId = requester?.manager_id ?? null;
      } else if (step.approver_type === 'SPECIFIC_EMPLOYEE') {
        assignedEmpId = step.approver_employee_id ?? null;
      }

      return {
        organization_id: this.auth.organizationId,
        instance_id: instance.id,
        step_order: step.step_order,
        name: step.name,
        status: StepStatus.PENDING,
        assigned_role: step.approver_type === 'ROLE' ? step.approver_role_code : null,
        assigned_employee_id: assignedEmpId,
      };
    });

    const { error: stepsErr } = await this.supabase
      .from('approval_steps')
      .insert(stepsPayload);

    if (stepsErr) {
      throw new AppError(`Failed to initialize workflow steps: ${stepsErr.message}`);
    }

    const workflowInstance = instance as ApprovalInstance;

    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: requesterId,
      traceId,
      action: 'approval.instance_submitted',
      resourceType: 'approval_instances',
      resourceId: workflowInstance.id,
      afterState: workflowInstance as unknown as Record<string, unknown>,
      metadata: { entityType: input.entityType, entityId: input.entityId },
      client: this.supabase,
    });

    return workflowInstance;
  }

  /**
   * Actions a workflow step (Approve, Reject, Delegate).
   */
  async actionStep(
    input: z.infer<typeof ActionWorkflowStepSchema>,
    traceId: string
  ): Promise<ApprovalInstance> {
    const actorEmployeeId = this.auth.employeeId;
    if (!actorEmployeeId) {
      throw new ValidationError('Authenticated user must be linked to an employee record to action workflows');
    }

    // 1. Fetch Instance
    const { data: instance, error: instErr } = await this.supabase
      .from('approval_instances')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('id', input.instanceId)
      .maybeSingle();

    if (instErr || !instance) {
      throw new NotFoundError('Workflow instance', input.instanceId);
    }

    if (instance.status !== ApprovalStatus.IN_PROGRESS) {
      throw new BusinessRuleError(`Cannot action instance with status '${instance.status}'`);
    }

    // 2. Fetch Current Active Step
    const { data: currentStep, error: stepErr } = await this.supabase
      .from('approval_steps')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('instance_id', instance.id)
      .eq('step_order', instance.current_step_order)
      .maybeSingle();

    if (stepErr || !currentStep) {
      throw new NotFoundError('Approval step for current order', String(instance.current_step_order));
    }

    const nowIso = new Date().toISOString();

    // 3. Perform Action
    if (input.action === WorkflowActionType.APPROVE) {
      // Mark step approved
      await this.supabase
        .from('approval_steps')
        .update({
          status: StepStatus.APPROVED,
          actioned_by: actorEmployeeId,
          actioned_at: nowIso,
          comments: input.comments ?? null,
          updated_at: nowIso,
        })
        .eq('id', currentStep.id);

      // Record step action
      await this.supabase.from('approval_actions').insert({
        organization_id: this.auth.organizationId,
        step_id: currentStep.id,
        actor_employee_id: actorEmployeeId,
        action: WorkflowActionType.APPROVE,
        comments: input.comments ?? null,
      });

      const isFinalStep = instance.current_step_order >= instance.total_steps;
      const nextStatus = isFinalStep ? ApprovalStatus.APPROVED : ApprovalStatus.IN_PROGRESS;
      const nextStepOrder = isFinalStep ? instance.current_step_order : instance.current_step_order + 1;

      const { data: updatedInstance } = await this.supabase
        .from('approval_instances')
        .update({
          status: nextStatus,
          current_step_order: nextStepOrder,
          updated_at: nowIso,
        })
        .eq('id', instance.id)
        .select()
        .single();

      await recordAuditLog({
        organizationId: this.auth.organizationId,
        actorUserId: this.auth.userId,
        actorEmployeeId,
        traceId,
        action: isFinalStep ? 'approval.workflow_completed' : 'approval.step_approved',
        resourceType: 'approval_instances',
        resourceId: instance.id,
        beforeState: instance as unknown as Record<string, unknown>,
        afterState: updatedInstance as unknown as Record<string, unknown>,
        metadata: { stepOrder: currentStep.step_order, isFinalStep },
        client: this.supabase,
      });

      return updatedInstance as ApprovalInstance;
    }

    if (input.action === WorkflowActionType.REJECT) {
      // Mark step rejected
      await this.supabase
        .from('approval_steps')
        .update({
          status: StepStatus.REJECTED,
          actioned_by: actorEmployeeId,
          actioned_at: nowIso,
          comments: input.comments ?? null,
          updated_at: nowIso,
        })
        .eq('id', currentStep.id);

      // Record step action
      await this.supabase.from('approval_actions').insert({
        organization_id: this.auth.organizationId,
        step_id: currentStep.id,
        actor_employee_id: actorEmployeeId,
        action: WorkflowActionType.REJECT,
        comments: input.comments ?? null,
      });

      // Mark instance rejected
      const { data: updatedInstance } = await this.supabase
        .from('approval_instances')
        .update({
          status: ApprovalStatus.REJECTED,
          updated_at: nowIso,
        })
        .eq('id', instance.id)
        .select()
        .single();

      await recordAuditLog({
        organizationId: this.auth.organizationId,
        actorUserId: this.auth.userId,
        actorEmployeeId,
        traceId,
        action: 'approval.step_rejected',
        resourceType: 'approval_instances',
        resourceId: instance.id,
        beforeState: instance as unknown as Record<string, unknown>,
        afterState: updatedInstance as unknown as Record<string, unknown>,
        metadata: { stepOrder: currentStep.step_order, comments: input.comments },
        client: this.supabase,
      });

      return updatedInstance as ApprovalInstance;
    }

    if (input.action === WorkflowActionType.DELEGATE) {
      // Reassign step
      await this.supabase
        .from('approval_steps')
        .update({
          assigned_employee_id: input.delegatedToEmployeeId,
          updated_at: nowIso,
        })
        .eq('id', currentStep.id);

      // Record delegation action
      await this.supabase.from('approval_actions').insert({
        organization_id: this.auth.organizationId,
        step_id: currentStep.id,
        actor_employee_id: actorEmployeeId,
        action: WorkflowActionType.DELEGATE,
        delegated_to_employee_id: input.delegatedToEmployeeId,
        comments: input.comments ?? null,
      });

      await recordAuditLog({
        organizationId: this.auth.organizationId,
        actorUserId: this.auth.userId,
        actorEmployeeId,
        traceId,
        action: 'approval.step_delegated',
        resourceType: 'approval_instances',
        resourceId: instance.id,
        metadata: {
          stepId: currentStep.id,
          delegatedTo: input.delegatedToEmployeeId,
        },
        client: this.supabase,
      });

      return instance as ApprovalInstance;
    }

    throw new ValidationError(`Unsupported workflow action '${input.action}'`);
  }
}
