export const PolicyDomain = {
  LEAVE: 'LEAVE',
  ATTENDANCE: 'ATTENDANCE',
  EXPENSE: 'EXPENSE',
  GENERAL: 'GENERAL',
} as const;

export type PolicyDomain = (typeof PolicyDomain)[keyof typeof PolicyDomain];

export const RuleType = {
  MAX_CONSECUTIVE_PAID_LEAVE: 'MAX_CONSECUTIVE_PAID_LEAVE',
  MINIMUM_NOTICE_DAYS: 'MINIMUM_NOTICE_DAYS',
  MINIMUM_LEAVE_BALANCE: 'MINIMUM_LEAVE_BALANCE',
  TEAM_AVAILABILITY_THRESHOLD: 'TEAM_AVAILABILITY_THRESHOLD',
} as const;

export type RuleType = (typeof RuleType)[keyof typeof RuleType];

export const RuleSeverity = {
  BLOCKING: 'BLOCKING',
  WARNING: 'WARNING',
  INFO: 'INFO',
} as const;

export type RuleSeverity = (typeof RuleSeverity)[keyof typeof RuleSeverity];

export const RuleEvaluationResult = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
} as const;

export type RuleEvaluationResult = (typeof RuleEvaluationResult)[keyof typeof RuleEvaluationResult];

export const OverallPolicyResult = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  POLICY_CONFLICT: 'POLICY_CONFLICT',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
} as const;

export type OverallPolicyResult = (typeof OverallPolicyResult)[keyof typeof OverallPolicyResult];

export interface Policy {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string | null;
  domain: PolicyDomain;
  version: number;
  effective_from: string;
  effective_to?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PolicyRule {
  id: string;
  organization_id: string;
  policy_id: string;
  rule_type: RuleType;
  rule_name: string;
  description?: string | null;
  configuration: Record<string, unknown>;
  severity: RuleSeverity;
  evaluation_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface EvaluatedRuleResult {
  rule_id: string;
  rule_type: RuleType;
  rule_name: string;
  severity: RuleSeverity;
  evaluation_order: number;
  result: RuleEvaluationResult;
  explanation: string;
  input_values: Record<string, unknown>;
  configured_values: Record<string, unknown>;
}

export interface PolicyEvaluation {
  id: string;
  organization_id: string;
  policy_id: string;
  policy_version: number;
  entity_type: string;
  entity_id: string;
  employee_id: string;
  overall_result: OverallPolicyResult;
  recommendation: string;
  evaluated_rules: EvaluatedRuleResult[];
  context_snapshot: Record<string, unknown>;
  evaluated_by?: string | null;
  created_at: string;
}

export interface LeaveEvaluationContext {
  leaveRequestId?: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  availableBalance?: number;
  applicationDate?: string;
  teamSize?: number;
  teamMembersOnLeave?: number;
}
