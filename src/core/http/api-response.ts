import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
  PaginationMeta,
} from '@/types/api-envelope';
import { AppError } from '@/core/errors/app-error';
import { ERROR_CODES } from '@/core/errors/error-codes';

/**
 * Creates a standard JSON Success Response
 */
export function successResponse<T>(
  data: T,
  statusCode = 200,
  traceId = uuidv4()
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Creates a standard JSON Paginated List Response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  statusCode = 200,
  traceId = uuidv4()
): NextResponse<ApiPaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        pagination,
        traceId,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Creates a standard JSON Error Response
 */
export function errorResponse(
  error: unknown,
  traceId = uuidv4()
): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          traceId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle generic error
  const message = error instanceof Error ? error.message : 'An unexpected server error occurred';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message,
        traceId,
      },
    },
    { status: 500 }
  );
}
