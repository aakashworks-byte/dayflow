import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ZodError, type ZodType } from 'zod';
import { createSupabaseServerClient } from '@/config/supabase-server';
import { buildAuthContext, type AuthContext } from '@/core/auth/auth-context';
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  type ValidationErrorDetail,
} from '@/core/errors/app-error';
import { ERROR_CODES } from '@/core/errors/error-codes';
import { successResponse, paginatedResponse, errorResponse } from '@/core/http/api-response';
import type { PaginationMeta } from '@/types/api-envelope';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RouteSegmentContext = {
  params?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export interface ApiHandlerContext<TBody = unknown, TQuery = unknown, TParams = unknown> {
  req: NextRequest;
  auth: AuthContext;
  supabase: SupabaseClient;
  traceId: string;
  body: TBody;
  query: TQuery;
  params: TParams;
}

export interface ApiHandlerContextPublic<TBody = unknown, TQuery = unknown, TParams = unknown> {
  req: NextRequest;
  auth: AuthContext | null;
  supabase: SupabaseClient;
  traceId: string;
  body: TBody;
  query: TQuery;
  params: TParams;
}

export type HandlerResult<TData = unknown> =
  | NextResponse
  | { status?: number; data: TData; pagination?: PaginationMeta }
  | { status?: number; data: TData }
  | TData;

export interface CreateApiHandlerOptions<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  TData = unknown,
  TAuth extends boolean = true,
> {
  auth?: TAuth;
  permissions?: string[];
  schema?: ZodType<TBody>;
  bodySchema?: ZodType<TBody>;
  querySchema?: ZodType<TQuery>;
  paramsSchema?: ZodType<TParams>;
  handler: (
    ctx: TAuth extends false
      ? ApiHandlerContextPublic<TBody, TQuery, TParams>
      : ApiHandlerContext<TBody, TQuery, TParams>
  ) => Promise<HandlerResult<TData>>;
}

/**
 * Higher-order Route Handler wrapper for Dayflow HRMS.
 * Enforces multi-tenant authentication, RBAC permissions, Zod validation,
 * trace ID propagation, and standardized JSON error and success envelopes.
 */
export function createApiHandler<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  TData = unknown,
  TAuth extends boolean = true,
>(options: CreateApiHandlerOptions<TBody, TQuery, TParams, TData, TAuth>) {
  const requiresAuth = options.auth !== false || (options.permissions && options.permissions.length > 0);
  const activeBodySchema = options.schema || options.bodySchema;

  return async function handleRoute(
    req: NextRequest,
    segmentContext?: RouteSegmentContext
  ): Promise<NextResponse> {
    const traceId = req.headers.get('x-trace-id') || uuidv4();

    try {
      const supabase = await createSupabaseServerClient();

      // 1. Authentication & Context Resolution
      let authContext: AuthContext | null = null;
      if (requiresAuth) {
        try {
          authContext = await buildAuthContext(supabase);
        } catch {
          throw new UnauthorizedError('Authentication required', ERROR_CODES.UNAUTHORIZED);
        }

        if (!authContext) {
          throw new UnauthorizedError('Authentication required', ERROR_CODES.UNAUTHORIZED);
        }

        // 2. RBAC Permission Validation
        if (options.permissions && options.permissions.length > 0) {
          const userPermissions = new Set(authContext.permissions || []);
          const hasAllPermissions = options.permissions.every((perm) => userPermissions.has(perm));

          if (!hasAllPermissions) {
            throw new ForbiddenError(
              'Access denied: insufficient permissions',
              ERROR_CODES.INSUFFICIENT_PERMISSIONS
            );
          }
        }
      }

      // 3. Route Params Parsing
      let parsedParams = {} as TParams;
      if (segmentContext?.params) {
        const rawParams =
          typeof (segmentContext.params as Promise<Record<string, unknown>>).then === 'function'
            ? await segmentContext.params
            : segmentContext.params;

        if (options.paramsSchema) {
          const paramsResult = options.paramsSchema.safeParse(rawParams);
          if (!paramsResult.success) {
            throw paramsResult.error;
          }
          parsedParams = paramsResult.data;
        } else {
          parsedParams = (rawParams || {}) as TParams;
        }
      }

      // 4. URL Query String Parsing
      let parsedQuery = {} as TQuery;
      if (options.querySchema) {
        const searchParams = req.nextUrl.searchParams;
        const queryObj: Record<string, string | string[]> = {};
        searchParams.forEach((value, key) => {
          const existing = queryObj[key];
          if (existing !== undefined) {
            if (Array.isArray(existing)) {
              existing.push(value);
            } else {
              queryObj[key] = [existing, value];
            }
          } else {
            queryObj[key] = value;
          }
        });

        const queryResult = options.querySchema.safeParse(queryObj);
        if (!queryResult.success) {
          throw queryResult.error;
        }
        parsedQuery = queryResult.data;
      }

      // 5. Request Body Parsing
      let parsedBody = undefined as TBody;
      if (activeBodySchema) {
        let rawBody: unknown;
        try {
          rawBody = await req.json();
        } catch {
          throw new ValidationError('Malformed JSON request body', [
            { message: 'Invalid JSON payload in request body' },
          ]);
        }

        const bodyResult = activeBodySchema.safeParse(rawBody);
        if (!bodyResult.success) {
          throw bodyResult.error;
        }
        parsedBody = bodyResult.data;
      }

      // 6. Invoke User Handler
      const handlerContext = {
        req,
        auth: authContext,
        supabase,
        traceId,
        body: parsedBody,
        query: parsedQuery,
        params: parsedParams,
      } as Parameters<typeof options.handler>[0];

      const result = await options.handler(handlerContext);

      // 7. Format Response
      if (result instanceof NextResponse) {
        return result;
      }

      if (result && typeof result === 'object') {
        const resObj = result as Record<string, unknown>;
        const statusCode = (resObj.status as number) || 200;

        if ('pagination' in resObj && resObj.pagination) {
          return paginatedResponse(
            resObj.data as unknown[],
            resObj.pagination as PaginationMeta,
            statusCode,
            traceId
          );
        }

        if ('data' in resObj) {
          return successResponse(resObj.data, statusCode, traceId);
        }
      }

      return successResponse(result, 200, traceId);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const details: ValidationErrorDetail[] = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        const validationError = new ValidationError('Validation failed', details);
        return errorResponse(validationError, traceId);
      }

      return errorResponse(err, traceId);
    }
  };
}
