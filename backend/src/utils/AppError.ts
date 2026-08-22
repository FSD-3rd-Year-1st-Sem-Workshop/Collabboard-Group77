export type SafeErrorData = unknown;

export class AppError extends Error {
  public statusCode: number;
  public errors?: SafeErrorData;

  constructor(message: string, statusCode: number, errors?: SafeErrorData) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
