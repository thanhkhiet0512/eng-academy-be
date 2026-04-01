export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, code = "BAD_REQUEST"): AppError {
    return new AppError(code, message, 400);
  }

  static notFound(message: string, code = "NOT_FOUND"): AppError {
    return new AppError(code, message, 404);
  }

  static forbidden(message: string, code = "FORBIDDEN"): AppError {
    return new AppError(code, message, 403);
  }

  static conflict(message: string, code = "CONFLICT"): AppError {
    return new AppError(code, message, 409);
  }

  static unauthorized(message: string, code = "UNAUTHORIZED"): AppError {
    return new AppError(code, message, 401);
  }
}
