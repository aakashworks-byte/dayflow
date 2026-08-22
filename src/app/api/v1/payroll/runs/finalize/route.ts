import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { FinalizePayrollRunSchema } from '@/modules/payroll/schemas';
import { PayrollService } from '@/modules/payroll/payroll.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.PAYROLL_PROCESS],
  schema: FinalizePayrollRunSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new PayrollService(supabase, auth);
    const run = await service.finalizePayrollRun(body, traceId);
    return { status: 200, data: run };
  },
});
