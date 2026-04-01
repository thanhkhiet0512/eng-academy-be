import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";
import { AppError } from "../errors/app.error";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      response.status(exception.httpStatus).json({
        statusCode: exception.httpStatus,
        code: exception.code,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(
        typeof body === "object" ? body : { statusCode: status, message: body },
      );
      return;
    }

    this.logger.error(exception);
    response.status(500).json({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  }
}
