import { ERROR_CODES, type ErrorCode } from './error-codes';

export interface ValidationErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Base Application Error class with HTTP status mapping
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ValidationErrorDetail[] | Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: ValidationErrorDetail[] | Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code: ErrorCode = ERROR_CODES.UNAUTHORIZED) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied: insufficient permissions', code: ErrorCode = ERROR_CODES.FORBIDDEN) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const msg = id ? `${resource} with ID '${id}' was not found` : `${resource} not found`;
    super(msg, 404, ERROR_CODES.NOT_FOUND);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ValidationErrorDetail[]) {
    super(message, 400, ERROR_CODES.VALIDATION_FAILED, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or duplicate entry', code: ErrorCode = ERROR_CODES.CONFLICT) {
    super(message, 409, code);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.BUSINESS_RULE_VIOLATION) {
    super(message, 422, code);
  }
}
