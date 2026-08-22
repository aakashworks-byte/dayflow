import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { ApplyLeaveSchema } from '@/modules/leave/schemas';
import { LeaveService } from '@/modules/leave/leave.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.LEAVE_APPLY_SELF],
  schema: ApplyLeaveSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new LeaveService(supabase, auth);
    const request = await service.applyLeave(body, traceId);
    return { status: 201, data: request };
  },
});
