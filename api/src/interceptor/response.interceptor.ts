import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '@kata/typings';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const responseContext = context.switchToHttp().getResponse();
        responseContext.status(HttpStatus.OK);

        const response: ApiResponse<T> = {
          data,
          success: true,
        };
        if (Array.isArray(data)) {
          response.count = data.length;
        }
        return response;
      })
    );
  }
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        const status =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        return throwError(() => ({
          success: false,
          status: status,
          message: err.response?.message || err.message,
        }));
      })
    );
  }
}
