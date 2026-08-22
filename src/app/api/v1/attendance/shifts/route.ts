import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CreateShiftSchema } from '@/modules/attendance/schemas';
import { AttendanceService } from '@/modules/attendance/attendance.service';

export const GET = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ATTENDANCE_READ_TEAM],
  handler: async ({ auth, supabase }) => {
    const service = new AttendanceService(supabase, auth);
    const shifts = await service.getShifts();
    return { data: shifts };
  },
});

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.ATTENDANCE_ADMIN],
  schema: CreateShiftSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new AttendanceService(supabase, auth);
    const shift = await service.createShift(body, traceId);
    return { status: 201, data: shift };
  },
});
