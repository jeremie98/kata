import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '../logger';
import { AuthService } from '../app/auth/auth.service';
import { LoginParams } from '@kata/typings';

@Injectable()
export class AuthorizationAccess implements CanActivate {
  private readonly logger = new Logger(AuthorizationAccess.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const body: LoginParams = req.body;

      const isAuthorized = await this.authService.authorizationAccess(
        body.email
      );

      if (isAuthorized) {
        return true;
      }

      throw new UnauthorizedException();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      return false;
    }
  }
}
