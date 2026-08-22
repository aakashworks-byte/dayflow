import type { ErrorCode } from '@/core/errors/error-codes';
import type { ValidationErrorDetail } from '@/core/errors/app-error';

export interface ApiMeta {
  traceId: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginatedMeta extends ApiMeta {
  pagination: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: ApiPaginatedMeta;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: ValidationErrorDetail[] | Record<string, unknown>;
  traceId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
