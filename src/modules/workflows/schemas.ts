import { z } from 'zod';
import { WorkflowActionType } from './types';

export const StepConfigSchema = z.object({
  step_order: z.number().int().positive(),
  name: z.string().min(2).max(150),
  approver_type: z.enum(['MANAGER', 'ROLE', 'SPECIFIC_EMPLOYEE']),
  approver_role_code: z.string().optional(),
  approver_employee_id: z.string().uuid().optional(),
});

export const CreateWorkflowDefinitionSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, 'Code must be uppercase alphanumeric'),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  entityType: z.string().min(2).max(100),
  stepsConfig: z.array(StepConfigSchema).min(1, 'At least one approval step is required'),
});

export const SubmitWorkflowInstanceSchema = z.object({
  definitionCode: z.string().min(2).max(50),
  entityType: z.string().min(2).max(100),
  entityId: z.string().min(1).max(100),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ActionWorkflowStepSchema = z.object({
  instanceId: z.string().uuid('Valid instanceId UUID required'),
  action: z.enum([WorkflowActionType.APPROVE, WorkflowActionType.REJECT, WorkflowActionType.DELEGATE]),
  comments: z.string().max(500).optional(),
  delegatedToEmployeeId: z.string().uuid().optional(),
}).refine((data) => {
  if (data.action === WorkflowActionType.DELEGATE && !data.delegatedToEmployeeId) {
    return false;
  }
  return true;
}, {
  message: 'delegatedToEmployeeId is required when delegating approval step',
  path: ['delegatedToEmployeeId'],
});

export const QueryWorkflowsSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  entityType: z.string().optional(),
  requesterId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
