import {
  RuleEvaluationResult,
  type EvaluatedRuleResult,
  type LeaveEvaluationContext,
  type PolicyRule,
} from '../types';

export function evaluateMaxConsecutivePaidLeave(
  rule: PolicyRule,
  context: LeaveEvaluationContext
): EvaluatedRuleResult {
  const maxConsecutiveDays = Number(rule.configuration.maxConsecutiveDays ?? 5);
  const requestedDays = Number(context.daysCount);

  if (isNaN(requestedDays) || requestedDays <= 0) {
    return {
      rule_id: rule.id,
      rule_type: rule.rule_type,
      rule_name: rule.rule_name,
      severity: rule.severity,
      evaluation_order: rule.evaluation_order,
      result: RuleEvaluationResult.INSUFFICIENT_DATA,
      explanation: 'Requested days count is missing or invalid in the evaluation context.',
      input_values: { requestedDays: context.daysCount },
      configured_values: { maxConsecutiveDays },
    };
  }

  const isPass = requestedDays <= maxConsecutiveDays;

  return {
    rule_id: rule.id,
    rule_type: rule.rule_type,
    rule_name: rule.rule_name,
    severity: rule.severity,
    evaluation_order: rule.evaluation_order,
    result: isPass ? RuleEvaluationResult.PASS : RuleEvaluationResult.FAIL,
    explanation: isPass
      ? `Requested ${requestedDays} days is within the maximum allowed ${maxConsecutiveDays} consecutive days.`
      : `Requested ${requestedDays} days exceeds the maximum allowed limit of ${maxConsecutiveDays} consecutive days.`,
    input_values: { requestedDays },
    configured_values: { maxConsecutiveDays },
  };
}
