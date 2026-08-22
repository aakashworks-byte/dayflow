import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthContext } from '@/core/auth/auth-context';
import { recordAuditLog } from '@/core/audit/audit-logger';
import { AppError, NotFoundError, ValidationError } from '@/core/errors/app-error';
import { evaluateRule } from './evaluators/ruleEvaluatorRegistry';
import type { Json } from '@/types/database.types';
import type { Policy, PolicyEvaluation, PolicyRule, LeaveEvaluationContext, EvaluatedRuleResult, OverallPolicyResult } from './types';


export class PolicyService {
  constructor(private readonly supabase: SupabaseClient, private readonly auth: AuthContext) {}

  /** Retrieve an active policy by code (or latest version) */
  async getPolicyByCode(code: string): Promise<Policy> {
    const { data, error } = await this.supabase
      .from('policies')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('code', code)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .maybeSingle();
    if (error || !data) {
      throw new NotFoundError('Policy', code);
    }
    return data as Policy;
  }

  /** Fetch ordered active rules for a policy */
  async getActiveRules(policyId: string): Promise<PolicyRule[]> {
    const { data, error } = await this.supabase
      .from('policy_rules')
      .select('*')
      .eq('organization_id', this.auth.organizationId)
      .eq('policy_id', policyId)
      .eq('is_active', true)
      .order('evaluation_order', { ascending: true });
    if (error) {
      throw new AppError(`Failed to fetch policy rules: ${error.message}`);
    }
    return (data || []) as PolicyRule[];
  }

  /** Core evaluation against a leave request context */
  async evaluateLeavePolicy(
    policyCodeOrId: { code?: string; id?: string },
    context: LeaveEvaluationContext,
    traceId: string
  ): Promise<PolicyEvaluation> {
    // Resolve policy
    let policy: Policy | undefined;
    if (policyCodeOrId.code) {
      policy = await this.getPolicyByCode(policyCodeOrId.code);
    } else if (policyCodeOrId.id) {
      const { data, error } = await this.supabase
        .from('policies')
        .select('*')
        .eq('organization_id', this.auth.organizationId)
        .eq('id', policyCodeOrId.id)
        .maybeSingle();
      if (error || !data) throw new NotFoundError('Policy', policyCodeOrId.id);
      policy = data as Policy;
    }
    if (!policy) throw new ValidationError('Policy identifier missing');

    const rules = await this.getActiveRules(policy.id);
    const evaluatedRules: EvaluatedRuleResult[] = [];
    let overallResult: OverallPolicyResult = 'APPROVE';
    const explanations: string[] = [];

    for (const rule of rules) {
      const result = evaluateRule(rule, context);
      evaluatedRules.push(result);
      if (result.result === 'FAIL') {
        if (rule.severity === 'BLOCKING') {
          overallResult = 'REJECT';
        } else if (overallResult !== 'REJECT') {
          overallResult = 'POLICY_CONFLICT';
        }
      } else if (result.result === 'INSUFFICIENT_DATA' && overallResult === 'APPROVE') {
        overallResult = 'INSUFFICIENT_DATA';
      }
      explanations.push(`${rule.rule_name}: ${result.explanation}`);
    }

    const recommendation =
      overallResult === 'APPROVE'
        ? 'Approve leave request.'
        : overallResult === 'REJECT'
        ? 'Reject leave request due to blocking rule failures.'
        : overallResult === 'POLICY_CONFLICT'
        ? 'Review non‑blocking rule conflicts.'
        : 'Insufficient data to make a decision.';

    // Persist evaluation
    const { data: evalRecord, error: evalErr } = await this.supabase
      .from('policy_evaluations')
      .insert({
        organization_id: this.auth.organizationId,
        policy_id: policy.id,
        policy_version: policy.version,
        entity_type: 'leave_request',
        entity_id: context.leaveRequestId ?? '',
        employee_id: context.employeeId,
        overall_result: overallResult,
        recommendation,
        evaluated_rules: JSON.stringify(evaluatedRules) as unknown as Json,
        context_snapshot: JSON.stringify(context) as unknown as Json,
        evaluated_by: this.auth.employeeId,
      })
      .select()
      .single();
    if (evalErr || !evalRecord) {
      throw new AppError(`Failed to persist policy evaluation: ${evalErr?.message || 'unknown'}`);
    }

    // Audit
    await recordAuditLog({
      organizationId: this.auth.organizationId,
      actorUserId: this.auth.userId,
      actorEmployeeId: this.auth.employeeId,
      traceId,
      action: 'policy.evaluated',
      resourceType: 'policy_evaluations',
      resourceId: (evalRecord as PolicyEvaluation).id,
      afterState: evalRecord as unknown as Record<string, unknown>,
      metadata: { policyId: policy.id, policyVersion: policy.version, overallResult, recommendation },
      client: this.supabase,
    });

    return {
      id: (evalRecord as PolicyEvaluation).id,
      organization_id: this.auth.organizationId,
      policy_id: policy.id,
      policy_version: policy.version,
      entity_type: 'leave_request',
      entity_id: context.leaveRequestId ?? '',
      employee_id: context.employeeId,
      overall_result: overallResult,
      recommendation,
      evaluated_rules: evaluatedRules,
      context_snapshot: context,
      evaluated_by: this.auth.employeeId,
      created_at: (evalRecord as PolicyEvaluation).created_at,
    };
  }
}
