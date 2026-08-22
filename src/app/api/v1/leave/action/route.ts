import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { ActionLeaveRequestSchema } from '@/modules/leave/schemas';
import { LeaveService } from '@/modules/leave/leave.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.LEAVE_APPROVE],
  schema: ActionLeaveRequestSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new LeaveService(supabase, auth);
    const request = await service.actionLeaveRequest(body, traceId);
    return { status: 200, data: request };
  },
});
