import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, map, throwError } from 'rxjs';
import { getErrorMessage } from '@kata/helpers';
import { Logger } from '../logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  public debug: boolean = true;

  constructor(@Inject(Reflector.name) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    try {
      const type = context.getType();
      const now = Date.now();

      let logger: Logger;

      const protectedKeys =
        this.reflector?.get<string[]>('keys', context.getHandler()) ?? [];

      let infos = {};

      switch (true) {
        case type === 'http':
          infos = this.getRequestInfos(context, protectedKeys);
          logger = new Logger(
            context.getClass().name,
            context.switchToHttp().getRequest()
          );
          break;
        case type === 'rpc':
          infos = this.getTcpInfos(context, protectedKeys);
          logger = new Logger(
            context.getClass().name,
            context.switchToRpc().getData()
          );
          break;
        default:
          logger = new Logger(context.getClass().name);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (['/check', '/api/check'].includes((infos as any).url)) {
        return next.handle();
      }

      return next.handle().pipe(
        catchError((err) => {
          try {
            const duration = `${Date.now() - now}ms`;

            logger.debug({
              type: `${type} in`,
              duration,
              ...infos,
            });
            logger.error({
              type: `${type} out`,
              duration,
              error: this.formatError(err),
            });

            return throwError(() => {
              return err;
            });
          } catch (error) {
            console.error('ERROR in LoggerInterceptor', error);

            return throwError(() => {
              return error;
            });
          }
        }),
        map((data) => {
          try {
            if (this.debug) {
              const duration = `${Date.now() - now}ms`;

              logger.debug({
                type: `${type} in`,
                duration,
                ...infos,
              });
              logger.debug({
                type: `${type} out`,
                duration,
                ...this.getOutInfos(data, null, protectedKeys),
              });
            }

            return data;
          } catch (err) {
            console.error('ERROR in LoggerInterceptor', err);

            return throwError(() => {
              return err;
            });
          }
        })
      );
    } catch (err) {
      console.error('ERROR in LoggerInterceptor', err);

      return throwError(() => {
        return err;
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatError(err: any) {
    let statusCode = null;
    const message = getErrorMessage(err);
    let sent = null;

    // Voir le comportement de l'ExceptionFilter
    if (err.status) {
      statusCode = err.status;
      sent = message;
    } else {
      statusCode = 500;
      sent =
        'Une erreur est survenue. Si le problème persiste, contactez l’assistance Kata : support@kata.fr';
    }

    return {
      statusCode,
      message,
      sent,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private removeSensitiveData(body: any, protectedKeys: string[]): unknown {
    if (
      protectedKeys.length === 0 ||
      typeof body !== 'object' ||
      body === null
    ) {
      return body;
    }

    if (Array.isArray(body)) {
      const newArray = [];
      for (const element of body) {
        newArray.push(this.removeSensitiveData(element, protectedKeys));
      }
      return newArray;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newObject: any = {};
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          if (protectedKeys.includes(key)) {
            newObject[key] = 'PROTECTED';
          } else {
            newObject[key] = this.removeSensitiveData(body[key], protectedKeys);
          }
        }
      }
      return newObject;
    }
  }

  private getRequestInfos = (
    context: ExecutionContext,
    protectedKeys: string[]
  ) => {
    const request = context.switchToHttp().getRequest();
    const { url, method, headers, body } = request;

    return {
      url,
      method,
      body: JSON.stringify(this.removeSensitiveData(body, protectedKeys)),
      user: headers.user
        ? {
            ...headers.user,
            accessToken: undefined,
          }
        : null,
      'user-agent': headers['user-agent'],
    };
  };

  private getTcpInfos = (
    context: ExecutionContext,
    protectedKeys: string[]
  ) => {
    const tcpContext = context.switchToRpc().getContext();
    const { data, headers } = context.switchToRpc().getData();

    return {
      from: headers?.app?.name ? `${headers.app.name}` : null,
      'target-route': JSON.parse(tcpContext.args[1]),
      body:
        data && Object.keys(data).length > 0
          ? JSON.stringify(this.removeSensitiveData(data, protectedKeys))
          : null,
      user:
        headers?.user && Object.keys(headers.user).length > 0
          ? {
              ...headers.user,
              accessToken: undefined,
            }
          : null,
    };
  };

  private getOutInfos = (
    data: unknown,
    error: unknown,
    protectedKeys: string[]
  ) => {
    return {
      body: data
        ? JSON.stringify(this.removeSensitiveData(data, protectedKeys))
        : null,
      error,
    };
  };
}
