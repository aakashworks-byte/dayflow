import { z } from 'zod';
import { PolicyDomain, RuleSeverity, RuleType } from './types';

export const CreatePolicySchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, 'Code must be alphanumeric uppercase'),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  domain: z.enum([
    PolicyDomain.LEAVE,
    PolicyDomain.ATTENDANCE,
    PolicyDomain.EXPENSE,
    PolicyDomain.GENERAL,
  ]).default(PolicyDomain.LEAVE),
  version: z.number().int().positive().default(1),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required').default(() => new Date().toISOString().split('T')[0]),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required').optional(),
});

export const CreatePolicyRuleSchema = z.object({
  policyId: z.string().uuid('Valid policyId UUID required'),
  ruleType: z.enum([
    RuleType.MAX_CONSECUTIVE_PAID_LEAVE,
    RuleType.MINIMUM_NOTICE_DAYS,
    RuleType.MINIMUM_LEAVE_BALANCE,
    RuleType.TEAM_AVAILABILITY_THRESHOLD,
  ]),
  ruleName: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  configuration: z.record(z.string(), z.unknown()),
  severity: z.enum([RuleSeverity.BLOCKING, RuleSeverity.WARNING, RuleSeverity.INFO]).default(RuleSeverity.BLOCKING),
  evaluationOrder: z.number().int().positive().default(1),
});

export const EvaluateLeavePolicySchema = z.object({
  policyCode: z.string().optional(),
  policyId: z.string().uuid().optional(),
  leaveRequestId: z.string().uuid().optional(),
  // Direct context parameters if evaluating pre-submission
  employeeId: z.string().uuid().optional(),
  leaveTypeId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  daysCount: z.number().positive().optional(),
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const QueryPoliciesSchema = z.object({
  domain: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
