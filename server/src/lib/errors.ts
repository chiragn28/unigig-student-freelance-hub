export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const BadRequest = (message = "Bad request", details?: unknown) =>
  new HttpError(400, "BAD_REQUEST", message, details);

export const Unauthorized = (message = "Unauthorized") =>
  new HttpError(401, "UNAUTHORIZED", message);

export const Forbidden = (message = "Forbidden") =>
  new HttpError(403, "FORBIDDEN", message);

export const NotFound = (message = "Not found") =>
  new HttpError(404, "NOT_FOUND", message);

export const Conflict = (message = "Conflict") =>
  new HttpError(409, "CONFLICT", message);

export const TooMany = (message = "Too many requests") =>
  new HttpError(429, "TOO_MANY_REQUESTS", message);
