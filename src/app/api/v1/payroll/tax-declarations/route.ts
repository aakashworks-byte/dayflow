import { createApiHandler } from '@/core/http/api-handler';
import { SubmitTaxDeclarationSchema } from '@/modules/payroll/schemas';
import { PayrollService } from '@/modules/payroll/payroll.service';

export const POST = createApiHandler({
  auth: true,
  schema: SubmitTaxDeclarationSchema,
  handler: async ({ body, auth, supabase, traceId }) => {
    const service = new PayrollService(supabase, auth);
    const declaration = await service.submitTaxDeclaration(body, traceId);
    return { status: 200, data: declaration };
  },
});
