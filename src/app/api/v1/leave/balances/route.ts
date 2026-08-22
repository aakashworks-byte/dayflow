import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { AllocateLeaveBalanceSchema } from '@/modules/leave/schemas';
import { LeaveService } from '@/modules/leave/leave.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.LEAVE_ADMIN],
  schema: AllocateLeaveBalanceSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new LeaveService(supabase, auth);
    const balance = await service.allocateBalance(body, traceId);
    return { status: 200, data: balance };
  },
});
