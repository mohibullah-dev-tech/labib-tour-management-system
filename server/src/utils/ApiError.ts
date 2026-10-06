export class ApiError extends Error {
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    public readonly statusCode: number,
    message: string,
    isOperational = true,
    details?: unknown,
    public readonly code = 'REQUEST_FAILED',
  ) {
    super(message);
    this.name = 'ApiError';
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, true, details, 'BAD_REQUEST');
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, true, undefined, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, true, undefined, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, true, undefined, 'NOT_FOUND');
  }
  static conflict(message: string) {
    return new ApiError(409, message, true, undefined, 'CONFLICT');
  }
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, false, undefined, 'INTERNAL_SERVER_ERROR');
  }
}
