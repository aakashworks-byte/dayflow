import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CheckOutSchema } from '@/modules/attendance/schemas';
import { AttendanceService } from '@/modules/attendance/attendance.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ATTENDANCE_LOG_SELF],
  schema: CheckOutSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new AttendanceService(supabase, auth);
    const record = await service.checkOut(body, traceId);
    return { status: 200, data: record };
  },
});
