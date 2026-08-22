import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { ActionWorkflowStepSchema } from '@/modules/workflows/schemas';
import { WorkflowService } from '@/modules/workflows/workflow.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.APPROVAL_ACTION],
  schema: ActionWorkflowStepSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new WorkflowService(supabase, auth);
    const instance = await service.actionStep(body, traceId);
    return { status: 200, data: instance };
  },
});
