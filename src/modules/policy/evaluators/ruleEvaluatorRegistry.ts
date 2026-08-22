import {
  RuleType,
  RuleEvaluationResult,
  type EvaluatedRuleResult,
  type LeaveEvaluationContext,
  type PolicyRule,
} from '../types';
import { evaluateMaxConsecutivePaidLeave } from './maxConsecutivePaidLeave';
import { evaluateMinimumNoticeDays } from './minimumNoticeDays';
import { evaluateMinimumLeaveBalance } from './minimumLeaveBalance';
import { evaluateTeamAvailabilityThreshold } from './teamAvailabilityThreshold';

export function evaluateRule(
  rule: PolicyRule,
  context: LeaveEvaluationContext
): EvaluatedRuleResult {
  switch (rule.rule_type) {
    case RuleType.MAX_CONSECUTIVE_PAID_LEAVE:
      return evaluateMaxConsecutivePaidLeave(rule, context);

    case RuleType.MINIMUM_NOTICE_DAYS:
      return evaluateMinimumNoticeDays(rule, context);

    case RuleType.MINIMUM_LEAVE_BALANCE:
      return evaluateMinimumLeaveBalance(rule, context);

    case RuleType.TEAM_AVAILABILITY_THRESHOLD:
      return evaluateTeamAvailabilityThreshold(rule, context);

    default:
      return {
        rule_id: rule.id,
        rule_type: rule.rule_type,
        rule_name: rule.rule_name,
        severity: rule.severity,
        evaluation_order: rule.evaluation_order,
        result: RuleEvaluationResult.INSUFFICIENT_DATA,
        explanation: `Unknown or unsupported rule type: ${rule.rule_type}`,
        input_values: {},
        configured_values: rule.configuration,
      };
  }
}
