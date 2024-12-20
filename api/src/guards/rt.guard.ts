import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '../logger';
import { AuthService } from '../app/auth/auth.service';
import { UserAccess } from '@kata/typings';

@Injectable()
export class AuthRtGuard implements CanActivate {
  private readonly logger = new Logger(AuthRtGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const accessToken = req.headers['authorization']?.split(' ')[1];

      const isTokenValid =
        await this.authService.checkRefreshToken(accessToken);
      if (!isTokenValid) throw new UnauthorizedException('Invalid token');

      if (isTokenValid) {
        const userDecode =
          await this.authService.tokenDecode<UserAccess>(accessToken);

        if (userDecode.userId) {
          req.headers['user'] = {
            userId: userDecode.userId,
            email: userDecode.email,
          };
        }
        return true;
      }

      throw new UnauthorizedException('User ID not found in token');
    } catch (err) {
      this.logger.error(err);
      throw err instanceof HttpException ? err : new UnauthorizedException();
    }
  }
}
