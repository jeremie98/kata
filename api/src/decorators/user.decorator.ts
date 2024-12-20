import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.headers['user']) {
      throw new UnauthorizedException(
        'User information not found in request headers'
      );
    }

    return request.headers['user'];
  }
);
