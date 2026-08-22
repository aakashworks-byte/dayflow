import { createApiHandler } from '@/core/http/api-handler';
import { PERMISSIONS } from '@/core/constants/permissions';
import { CreateSalaryStructureSchema } from '@/modules/payroll/schemas';
import { PayrollService } from '@/modules/payroll/payroll.service';

export const POST = createApiHandler({
  auth: true,
  permissions: [PERMISSIONS.PAYROLL_ADMIN],
  schema: CreateSalaryStructureSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new PayrollService(supabase, auth);
    const structure = await service.createSalaryStructure(body, traceId);
    return { status: 201, data: structure };
  },
});
