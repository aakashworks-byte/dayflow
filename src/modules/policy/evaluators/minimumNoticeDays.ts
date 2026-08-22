import {
  RuleEvaluationResult,
  type EvaluatedRuleResult,
  type LeaveEvaluationContext,
  type PolicyRule,
} from '../types';

export function evaluateMinimumNoticeDays(
  rule: PolicyRule,
  context: LeaveEvaluationContext
): EvaluatedRuleResult {
  const minNoticeDays = Number(rule.configuration.minNoticeDays ?? 3);

  if (!context.startDate) {
    return {
      rule_id: rule.id,
      rule_type: rule.rule_type,
      rule_name: rule.rule_name,
      severity: rule.severity,
      evaluation_order: rule.evaluation_order,
      result: RuleEvaluationResult.INSUFFICIENT_DATA,
      explanation: 'Start date is missing in the evaluation context.',
      input_values: { startDate: context.startDate },
      configured_values: { minNoticeDays },
    };
  }

  const appDateStr = context.applicationDate || new Date().toISOString().split('T')[0];
  const appDate = new Date(appDateStr);
  const startDate = new Date(context.startDate);

  const diffMs = startDate.getTime() - appDate.getTime();
  const noticeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isPass = noticeDays >= minNoticeDays;

  return {
    rule_id: rule.id,
    rule_type: rule.rule_type,
    rule_name: rule.rule_name,
    severity: rule.severity,
    evaluation_order: rule.evaluation_order,
    result: isPass ? RuleEvaluationResult.PASS : RuleEvaluationResult.FAIL,
    explanation: isPass
      ? `Provided ${noticeDays} day(s) advance notice satisfies the minimum required notice of ${minNoticeDays} day(s).`
      : `Provided ${noticeDays} day(s) advance notice is less than the required ${minNoticeDays} day(s).`,
    input_values: { noticeDays, applicationDate: appDateStr, startDate: context.startDate },
    configured_values: { minNoticeDays },
  };
}
