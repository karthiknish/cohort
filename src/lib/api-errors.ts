/**
 * Base class for all API errors
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(message: string, status: number, code = 'INTERNAL_ERROR', details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation or input errors
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 400 Bad Request - Generic invalid request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Permission denied
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends ApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message?: string, resourceType?: string, resourceId?: string) {
    // Build message dynamically if resource info is provided
    let finalMessage = message || 'Resource not found';
    if (!message && resourceType && resourceId) {
      finalMessage = `${resourceType} with ID '${resourceId}' not found`;
    } else if (!message && resourceType) {
      finalMessage = `${resourceType} not found`;
    }
    
    super(finalMessage, 404, 'NOT_FOUND');
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict occurred') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * 503 Service Unavailable - Downstream or temporary failure
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}
