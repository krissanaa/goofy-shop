export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "SOLD_OUT"
  | "LIMIT_EXCEEDED"
  | "DROP_NOT_STARTED"
  | "RESERVATION_EXPIRED"
  | "QUEUE_REQUIRED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;
