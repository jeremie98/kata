import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@kata/prisma';
import { UserAccess } from '@kata/typings';
import { AuthService } from '../app/auth/auth.service';

@Injectable()
export class EventParticipantGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessToken = req.headers['authorization']?.split(' ')[1];

    const userDecode =
      await this.authService.tokenDecode<UserAccess>(accessToken);

    const isParticipant = await this.prisma.eventParticipant.findFirst({
      where: {
        event_id: req.params.id,
        user_id: userDecode.userId,
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        'Vous ne pouvez pas effectuer cette action sur cet événement'
      );
    }

    return true;
  }
}
