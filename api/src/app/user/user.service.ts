import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@kata/prisma';
import { EventReturn, UserReturn } from '@kata/typings';
import { UserNotFoundException } from '../../exceptions';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchAllUsers(): Promise<UserReturn[]> {
    return await this.prisma.user.findMany({
      where: { deleted_at: null },
      omit: {
        password: true,
        updated_at: true,
        deleted_at: true,
      },
    });
  }

  async fetchUserById(id: string): Promise<UserReturn> {
    return await this.findUniqueUser({
      where: { user_id: id, deleted_at: null },
      omit: {
        password: true,
        updated_at: true,
        deleted_at: true,
      },
    });
  }

  async fetchUserEvents(id: string): Promise<EventReturn[]> {
    const userEvents = await this.prisma.eventParticipant.findMany({
      where: { user_id: id },
      include: {
        event: true,
      },
    });

    return userEvents.map((participant) => participant.event);
  }

  private async findUniqueUser(
    args: Prisma.UserFindUniqueArgs
  ): Promise<UserReturn> {
    const user = await this.prisma.user.findUnique(args);

    if (!user) throw new UserNotFoundException();

    return user;
  }
}
