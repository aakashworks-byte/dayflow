import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CreateWorkflowDefinitionSchema } from '@/modules/workflows/schemas';
import { WorkflowService } from '@/modules/workflows/workflow.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ORG_MANAGE],
  schema: CreateWorkflowDefinitionSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new WorkflowService(supabase, auth);
    const definition = await service.createDefinition(body, traceId);
    return { status: 201, data: definition };
  },
});
