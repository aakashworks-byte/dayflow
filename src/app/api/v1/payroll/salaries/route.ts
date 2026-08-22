import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { AssignEmployeeSalarySchema } from '@/modules/payroll/schemas';
import { PayrollService } from '@/modules/payroll/payroll.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.PAYROLL_ADMIN],
  schema: AssignEmployeeSalarySchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new PayrollService(supabase, auth);
    const salary = await service.assignSalary(body, traceId);
    return { status: 200, data: salary };
  },
});
