import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { SubmitWorkflowInstanceSchema } from '@/modules/workflows/schemas';
import { WorkflowService } from '@/modules/workflows/workflow.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.APPROVAL_SUBMIT],
  schema: SubmitWorkflowInstanceSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new WorkflowService(supabase, auth);
    const instance = await service.submitInstance(body, traceId);
    return { status: 201, data: instance };
  },
});
