import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export type ApiResponse<T> = {
  data: T | null;
  message: string;
  statusCode: number;
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode as number;
    return next.handle().pipe(
      map((data) => ({
        data: data ?? null,
        message: "success",
        statusCode,
      })),
    );
  }
}
