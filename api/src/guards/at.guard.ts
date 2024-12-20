import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserAccess } from '@kata/typings';
import { Reflector } from '@nestjs/core';
import { Logger } from '../logger';
import { AuthService } from '../app/auth/auth.service';

@Injectable()
export class AuthAtGuard implements CanActivate {
  private readonly logger = new Logger(AuthAtGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.get<boolean>(
        'isPublic',
        context.getHandler()
      );

      if (isPublic) return true;

      const req = context.switchToHttp().getRequest();
      const accessToken = req.headers['authorization']?.split(' ')[1];

      if (!accessToken) throw new UnauthorizedException('No token provided');

      const isTokenValid = await this.authService.checkAccessToken(accessToken);
      if (!isTokenValid) throw new UnauthorizedException('Invalid token');

      const userDecode =
        await this.authService.tokenDecode<UserAccess>(accessToken);

      if (userDecode.userId) {
        req.headers['user'] = {
          userId: userDecode.userId,
          email: userDecode.email,
        };
        return true;
      }

      throw new UnauthorizedException('User ID not found in token');
    } catch (err) {
      this.logger.error(err);
      throw err instanceof HttpException ? err : new UnauthorizedException();
    }
  }
}
