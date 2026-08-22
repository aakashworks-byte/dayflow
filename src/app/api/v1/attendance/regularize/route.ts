import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { RegularizeAttendanceSchema } from '@/modules/attendance/schemas';
import { AttendanceService } from '@/modules/attendance/attendance.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ATTENDANCE_APPROVE],
  schema: RegularizeAttendanceSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new AttendanceService(supabase, auth);
    const record = await service.regularize(body, traceId);
    return { status: 200, data: record };
  },
});
