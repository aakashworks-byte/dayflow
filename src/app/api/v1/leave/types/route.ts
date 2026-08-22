import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CreateLeaveTypeSchema } from '@/modules/leave/schemas';
import { LeaveService } from '@/modules/leave/leave.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.LEAVE_ADMIN],
  schema: CreateLeaveTypeSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new LeaveService(supabase, auth);
    const leaveType = await service.createLeaveType(body, traceId);
    return { status: 201, data: leaveType };
  },
});
