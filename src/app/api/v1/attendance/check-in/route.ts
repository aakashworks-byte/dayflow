import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CheckInSchema } from '@/modules/attendance/schemas';
import { AttendanceService } from '@/modules/attendance/attendance.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ATTENDANCE_LOG_SELF],
  schema: CheckInSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new AttendanceService(supabase, auth);
    const record = await service.checkIn(body, traceId);
    return { status: 201, data: record };
  },
});
