import {
  RuleEvaluationResult,
  type EvaluatedRuleResult,
  type LeaveEvaluationContext,
  type PolicyRule,
} from '../types';

export function evaluateTeamAvailabilityThreshold(
  rule: PolicyRule,
  context: LeaveEvaluationContext
): EvaluatedRuleResult {
  const minTeamPresencePercentage = Number(rule.configuration.minTeamPresencePercentage ?? 50);
  const teamSize = context.teamSize !== undefined ? Number(context.teamSize) : undefined;
  const teamMembersOnLeave = context.teamMembersOnLeave !== undefined ? Number(context.teamMembersOnLeave) : 0;

  if (teamSize === undefined || teamSize <= 1) {
    return {
      rule_id: rule.id,
      rule_type: rule.rule_type,
      rule_name: rule.rule_name,
      severity: rule.severity,
      evaluation_order: rule.evaluation_order,
      result: RuleEvaluationResult.INSUFFICIENT_DATA,
      explanation: 'Team size is insufficient or unavailable to calculate department concurrency threshold.',
      input_values: { teamSize, teamMembersOnLeave },
      configured_values: { minTeamPresencePercentage },
    };
  }

  // Account for current requester being on leave
  const projectedPresent = Math.max(0, teamSize - (teamMembersOnLeave + 1));
  const presencePercentage = Math.round((projectedPresent / teamSize) * 100);

  const isPass = presencePercentage >= minTeamPresencePercentage;

  return {
    rule_id: rule.id,
    rule_type: rule.rule_type,
    rule_name: rule.rule_name,
    severity: rule.severity,
    evaluation_order: rule.evaluation_order,
    result: isPass ? RuleEvaluationResult.PASS : RuleEvaluationResult.FAIL,
    explanation: isPass
      ? `Projected team presence of ${presencePercentage}% (${projectedPresent}/${teamSize} members) meets the minimum threshold of ${minTeamPresencePercentage}%.`
      : `Projected team presence of ${presencePercentage}% (${projectedPresent}/${teamSize} members) falls below the minimum required threshold of ${minTeamPresencePercentage}%.`,
    input_values: { teamSize, teamMembersOnLeave, projectedPresent, presencePercentage },
    configured_values: { minTeamPresencePercentage },
  };
}
