import {
  RuleEvaluationResult,
  type EvaluatedRuleResult,
  type LeaveEvaluationContext,
  type PolicyRule,
} from '../types';

export function evaluateMinimumLeaveBalance(
  rule: PolicyRule,
  context: LeaveEvaluationContext
): EvaluatedRuleResult {
  const minRemainingBalance = Number(rule.configuration.minRemainingBalanceAfterRequest ?? 0);
  const requestedDays = Number(context.daysCount);
  const availableBalance = context.availableBalance !== undefined ? Number(context.availableBalance) : undefined;

  if (availableBalance === undefined || isNaN(availableBalance)) {
    return {
      rule_id: rule.id,
      rule_type: rule.rule_type,
      rule_name: rule.rule_name,
      severity: rule.severity,
      evaluation_order: rule.evaluation_order,
      result: RuleEvaluationResult.INSUFFICIENT_DATA,
      explanation: 'Available leave balance is not available in the evaluation context.',
      input_values: { requestedDays, availableBalance: context.availableBalance },
      configured_values: { minRemainingBalanceAfterRequest: minRemainingBalance },
    };
  }

  const remainingAfter = availableBalance - requestedDays;
  const isPass = remainingAfter >= minRemainingBalance;

  return {
    rule_id: rule.id,
    rule_type: rule.rule_type,
    rule_name: rule.rule_name,
    severity: rule.severity,
    evaluation_order: rule.evaluation_order,
    result: isPass ? RuleEvaluationResult.PASS : RuleEvaluationResult.FAIL,
    explanation: isPass
      ? `Available balance of ${availableBalance} days is sufficient for requested ${requestedDays} days (remaining: ${remainingAfter} days).`
      : `Insufficient leave balance: Available is ${availableBalance} days, but ${requestedDays} days were requested (deficit: ${Math.abs(remainingAfter)} days).`,
    input_values: { availableBalance, requestedDays, remainingAfter },
    configured_values: { minRemainingBalanceAfterRequest: minRemainingBalance },
  };
}
