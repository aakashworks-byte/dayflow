export const ApprovalStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const StepStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED',
} as const;

export type StepStatus = (typeof StepStatus)[keyof typeof StepStatus];

export const WorkflowActionType = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DELEGATE: 'DELEGATE',
} as const;

export type WorkflowActionType = (typeof WorkflowActionType)[keyof typeof WorkflowActionType];

export interface StepConfig {
  step_order: number;
  name: string;
  approver_type: 'MANAGER' | 'ROLE' | 'SPECIFIC_EMPLOYEE';
  approver_role_code?: string;
  approver_employee_id?: string;
}

export interface ApprovalDefinition {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string | null;
  entity_type: string;
  steps_config: StepConfig[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ApprovalInstance {
  id: string;
  organization_id: string;
  definition_id: string;
  requester_id: string;
  entity_type: string;
  entity_id: string;
  current_step_order: number;
  total_steps: number;
  status: ApprovalStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  organization_id: string;
  instance_id: string;
  step_order: number;
  name: string;
  status: StepStatus;
  assigned_role?: string | null;
  assigned_employee_id?: string | null;
  actioned_by?: string | null;
  actioned_at?: string | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalAction {
  id: string;
  organization_id: string;
  step_id: string;
  actor_employee_id: string;
  action: WorkflowActionType;
  delegated_to_employee_id?: string | null;
  comments?: string | null;
  created_at: string;
}
