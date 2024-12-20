import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@kata/prisma';
import {
  AddRemoveParticipantsParams,
  CreateUpdateEventParams,
  DetectScheduleConflictsParams,
  DetectScheduleConflictsResponse,
  EventReturn,
} from '@kata/typings';
import {
  EventNotFoundException,
  EventParticipantsConflictsException,
} from '../../exceptions';
import dayjs from '@kata/day';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { SendMailClient } from '@kata/mail';

@Injectable()
export class EventService {
  private readonly mailClient = new SendMailClient().sendMail;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async fetchOneById(id: string): Promise<EventReturn> {
    return await this.findUniqueEvent({
      where: { event_id: id },
    });
  }

  async createEvent(payload: CreateUpdateEventParams): Promise<EventReturn> {
    const { dateStart, dateEnd, title, type, participantIds } = payload;

    const event = await this.prisma.event.create({
      data: {
        title,
        date_start: dayjs(dateStart, 'YYYY-MM-DD HH:mm:ss').toDate(),
        date_end: dayjs(dateEnd, 'YYYY-MM-DD HH:mm:ss').toDate(),
        type,
      },
      include: {
        participants: {
          include: {
            user: {
              omit: {
                password: true,
                updated_at: true,
                deleted_at: true,
              },
            },
          },
        },
      },
    });

    const dataParticipants = participantIds.map((pId) => ({
      event_id: event.event_id,
      user_id: pId,
    }));

    const conflicts = await this.detectScheduleConflicts({
      dateStart,
      dateEnd,
      participantIds,
    });

    if (conflicts.length > 0) {
      throw new EventParticipantsConflictsException();
    }

    await this.prisma.eventParticipant.createMany({
      data: dataParticipants,
      skipDuplicates: true,
    });

    for (const pId of participantIds) {
      this.notificationsGateway.sendNotificationToUser(
        pId,
        `Vous avez été invité à l'événement ${event.title}.`
      );
    }

    const participants = await this.prisma.user.findMany({
      where: {
        user_id: { in: participantIds },
      },
      omit: {
        password: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    await this.mailClient.sendMailing({
      from: {
        email: String(process.env.AUTOMATIC_MAIL),
        name: 'Kata',
      },
      to: participants.map((p) => p.email),
      text: `Vous avez été invité à l'événement ${event.title}.`,
    });

    return {
      ...event,
      participants,
    };
  }

  async updateEvent(
    idEvent: string,
    payload: CreateUpdateEventParams
  ): Promise<EventReturn> {
    const { dateStart, dateEnd, title, type } = payload;

    const event = await this.findUniqueEvent({ where: { event_id: idEvent } });
    const updatedEvent = await this.prisma.event.update({
      where: { event_id: event.event_id },
      data: {
        title,
        date_start: dayjs(dateStart, 'YYYY-MM-DD HH:mm:ss').toDate(),
        date_end: dayjs(dateEnd, 'YYYY-MM-DD HH:mm:ss').toDate(),
        type,
      },
      include: {
        participants: {
          include: {
            user: {
              omit: {
                password: true,
                updated_at: true,
                deleted_at: true,
              },
            },
          },
        },
      },
    });

    if (updatedEvent.participants && updatedEvent.participants.length > 0) {
      for (const p of updatedEvent.participants) {
        this.notificationsGateway.sendNotificationToUser(
          p.user_id,
          `L'événement ${updatedEvent.title} a été mis à jour.`
        );
      }

      await this.mailClient.sendMailing({
        from: {
          email: String(process.env.AUTOMATIC_MAIL),
          name: 'Kata',
        },
        to: updatedEvent.participants.map((p) => p.user.email),
        text: `L'événement ${updatedEvent.title} a été mis à jour.`,
      });
    }

    return {
      ...updatedEvent,
      participants: updatedEvent.participants.map((p) => p.user),
    };
  }

  async deleteEvent(idEvent: string): Promise<boolean> {
    const event = await this.findUniqueEvent({ where: { event_id: idEvent } });
    const deletedEvent = await this.prisma.event.delete({
      where: { event_id: event.event_id },
    });

    if (!deletedEvent) return false;

    if (event.participants && event.participants.length > 0) {
      for (const p of event.participants) {
        this.notificationsGateway.sendNotificationToUser(
          p.user_id,
          `L'événement ${event.title} a été annulé.`
        );
      }

      await this.mailClient.sendMailing({
        from: {
          email: String(process.env.AUTOMATIC_MAIL),
          name: 'Kata',
        },
        to: event.participants.map((p) => p.email),
        text: `L'événement ${event.title} a été annulé.`,
      });
    }

    return true;
  }

  async addParticipants(
    idEvent: string,
    payload: AddRemoveParticipantsParams
  ): Promise<EventReturn> {
    const { participantIds } = payload;

    if (!participantIds || participantIds.length === 0) {
      throw new Error('No participant IDs provided for addition.');
    }

    const event = await this.findUniqueEvent({
      where: { event_id: idEvent },
    });

    const conflicts = await this.detectScheduleConflicts({
      dateStart: dayjs(event.date_start).format('YYYY-MM-DD HH:mm:ss'),
      dateEnd: dayjs(event.date_end).format('YYYY-MM-DD HH:mm:ss'),
      participantIds,
    });

    if (conflicts.length > 0) {
      throw new EventParticipantsConflictsException();
    }

    await this.prisma.eventParticipant.createMany({
      data: participantIds.map((pId) => ({
        event_id: event.event_id,
        user_id: pId,
      })),
      skipDuplicates: true,
    });

    for (const pId of participantIds) {
      this.notificationsGateway.sendNotificationToUser(
        pId,
        `Vous avez été invité à l'événement ${event.title}.`
      );
    }

    const participants = await this.prisma.user.findMany({
      where: {
        user_id: { in: participantIds },
      },
      omit: {
        password: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    await this.mailClient.sendMailing({
      from: {
        email: String(process.env.AUTOMATIC_MAIL),
        name: 'Kata',
      },
      to: participants.map((p) => p.email),
      text: `Vous avez été invité à l'événement ${event.title}.`,
    });

    return event;
  }

  async removeParticipants(
    idEvent: string,
    payload: AddRemoveParticipantsParams
  ): Promise<EventReturn> {
    const { participantIds } = payload;

    if (!participantIds || participantIds.length === 0) {
      throw new Error('No participant IDs provided for removal.');
    }

    const event = await this.findUniqueEvent({
      where: { event_id: idEvent },
    });

    await this.prisma.eventParticipant.deleteMany({
      where: {
        event_id: event.event_id,
        user_id: { in: participantIds },
      },
    });

    for (const pId of participantIds) {
      this.notificationsGateway.sendNotificationToUser(
        pId,
        `Vous avez été supprimé de l'événement ${event.title}.`
      );
    }

    const participants = await this.prisma.user.findMany({
      where: {
        user_id: { in: participantIds },
      },
      omit: {
        password: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    await this.mailClient.sendMailing({
      from: {
        email: String(process.env.AUTOMATIC_MAIL),
        name: 'Kata',
      },
      to: participants.map((p) => p.email),
      text: `Vous avez été supprimé de l'événement ${event.title}.`,
    });

    return event;
  }

  async detectScheduleConflicts(
    payload: DetectScheduleConflictsParams
  ): Promise<DetectScheduleConflictsResponse[]> {
    const { dateStart, dateEnd, participantIds } = payload;

    const conflicts = await this.prisma.eventParticipant.findMany({
      where: {
        user_id: { in: participantIds },
        event: {
          OR: [
            {
              date_start: {
                lte: dayjs(dateEnd, 'YYYY-MM-DD HH:mm:ss').toDate(),
              },
              date_end: {
                gte: dayjs(dateStart, 'YYYY-MM-DD HH:mm:ss').toDate(),
              },
            },
          ],
        },
      },
      include: {
        user: {
          omit: {
            password: true,
            updated_at: true,
            deleted_at: true,
          },
        },
        event: true,
      },
    });

    if (!conflicts || conflicts.length === 0) return [];

    const groupedConflicts = participantIds.map((pId) => {
      const userConflicts = conflicts.filter(
        (conflict) => conflict.user_id === pId
      );

      return {
        user: userConflicts[0]?.user,
        conflictingEvents: userConflicts.map((conflict) => conflict.event),
      };
    });

    return groupedConflicts.filter(
      (group) => group.conflictingEvents.length > 0 && group.user
    );
  }

  private async findUniqueEvent(
    args: Prisma.EventFindUniqueArgs
  ): Promise<EventReturn> {
    const event = await this.prisma.event.findUnique({
      ...args,
      include: {
        participants: {
          include: {
            user: {
              omit: {
                password: true,
                updated_at: true,
                deleted_at: true,
              },
            },
          },
        },
      },
    });

    if (!event) throw new EventNotFoundException();

    return {
      ...event,
      participants: event.participants.map((p) => p.user),
    };
  }
}
