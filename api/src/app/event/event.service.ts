import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@kata/prisma';
import {
  CreateUpdateEventParams,
  DetectScheduleConflictsParams,
  DetectScheduleConflictsResponse,
  EventReturn,
  FetchEventsPlanningParams,
  SuggestFreeCalendarSlotsResponse,
} from '@kata/typings';
import {
  EventNotFoundException,
  EventParticipantsConflictsException,
} from '../../exceptions';
import dayjs from '@kata/day';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { SendMailClient } from '@kata/mail';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);

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

  async fetchEventsPlanning(
    params: FetchEventsPlanningParams
  ): Promise<EventReturn[]> {
    const { dateStart, dateEnd } = params;

    if (!dateStart || !dateEnd) return [];

    const events = await this.prisma.event.findMany({
      where: {
        date_start: {
          lte: dayjs(dateEnd, 'YYYY-MM-DD').endOf('day').toDate(),
        },
        date_end: {
          gte: dayjs(dateStart, 'YYYY-MM-DD').startOf('day').toDate(),
        },
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

    return events.map((e) => {
      return {
        ...e,
        participants: e.participants.map((p) => p.user),
      };
    });
  }

  async createEvent(
    payload: CreateUpdateEventParams
  ): Promise<EventReturn | DetectScheduleConflictsResponse[]> {
    const { dateStart, dateEnd, title, type, participantIds } = payload;

    const conflicts = await this.detectScheduleConflicts({
      dateStart,
      dateEnd,
      participantIds,
    });

    if (conflicts.length > 0) {
      throw new EventParticipantsConflictsException(conflicts);
    }

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

    // await this.mailClient.sendMailing({
    //   from: {
    //     email: String(process.env.AUTOMATIC_MAIL),
    //     name: 'Kata',
    //   },
    //   to: participants.map((p) => p.email),
    //   text: `Vous avez été invité à l'événement ${event.title}.`,
    // });

    return {
      ...event,
      participants,
    };
  }

  async updateEvent(
    idEvent: string,
    payload: CreateUpdateEventParams
  ): Promise<EventReturn> {
    const { dateStart, dateEnd, title, type, participantIds } = payload;

    const event = await this.findUniqueEvent({ where: { event_id: idEvent } });

    const originalEventParticipantIds =
      event.participants?.map((p) => p.user_id) ?? [];
    const newEventParticipantIds = participantIds.filter(
      (id) => !originalEventParticipantIds.includes(id)
    );
    const removedEventParticipantIds = originalEventParticipantIds.filter(
      (id) => !participantIds.includes(id)
    );

    const conflicts = await this.detectScheduleConflicts({
      dateStart,
      dateEnd,
      participantIds: newEventParticipantIds,
    });

    if (conflicts.length > 0) {
      throw new EventParticipantsConflictsException(conflicts);
    }

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
    }

    const dataNewParticipants = newEventParticipantIds.map((pId) => ({
      event_id: event.event_id,
      user_id: pId,
    }));

    await this.prisma.eventParticipant.createMany({
      data: dataNewParticipants,
      skipDuplicates: true,
    });

    for (const pId of newEventParticipantIds) {
      this.notificationsGateway.sendNotificationToUser(
        pId,
        `Vous avez été invité à l'événement ${event.title}.`
      );
    }

    await this.prisma.eventParticipant.deleteMany({
      where: {
        event_id: event.event_id,
        user_id: { in: removedEventParticipantIds },
      },
    });

    for (const pId of removedEventParticipantIds) {
      this.notificationsGateway.sendNotificationToUser(
        pId,
        `Vous avez été supprimé de l'événement ${event.title}.`
      );
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

      // await this.mailClient.sendMailing({
      //   from: {
      //     email: String(process.env.AUTOMATIC_MAIL),
      //     name: 'Kata',
      //   },
      //   to: event.participants.map((p) => p.email),
      //   text: `L'événement ${event.title} a été annulé.`,
      // });
    }

    return true;
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

  async suggestFreeCalendarSlots(
    payload: DetectScheduleConflictsParams
  ): Promise<SuggestFreeCalendarSlotsResponse[]> {
    const { dateStart, dateEnd, participantIds } = payload;

    const suggestionsCount = parseInt(
      process.env.SUGGESTIONS_SLOTS_NUMBERS || '4',
      10
    );
    const start = dayjs(dateStart, 'YYYY-MM-DD HH:mm:ss');
    const end = dayjs(dateEnd, 'YYYY-MM-DD HH:mm:ss');
    const slotDuration = end.diff(start, 'millisecond');

    const conflicts = await this.prisma.eventParticipant.findMany({
      where: {
        user_id: { in: participantIds },
        event: {
          OR: [
            {
              date_start: { lte: end.endOf('day').toDate() },
              date_end: { gte: start.startOf('day').toDate() },
            },
          ],
        },
      },
      include: {
        event: true,
      },
    });

    const sortedConflicts = conflicts
      .map((conflict) => ({
        dateStart: dayjs(conflict.event.date_start),
        dateEnd: dayjs(conflict.event.date_end),
      }))
      .sort((a, b) => a.dateStart.diff(b.dateStart));

    const freeSlots: SuggestFreeCalendarSlotsResponse[] =
      await this.findFreeSlots(
        start,
        end,
        slotDuration,
        suggestionsCount,
        sortedConflicts
      );

    return freeSlots.sort(
      (a, b) =>
        new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
    );
  }

  private async findFreeSlots(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    slotDuration: number,
    suggestionsCount: number,
    conflicts: { dateStart: dayjs.Dayjs; dateEnd: dayjs.Dayjs }[]
  ): Promise<SuggestFreeCalendarSlotsResponse[]> {
    const freeSlots: SuggestFreeCalendarSlotsResponse[] = [];
    let beforeCursor = start.subtract(slotDuration, 'millisecond');
    let afterCursor = end;
    let i = 0;

    while (freeSlots.length < suggestionsCount) {
      const searchPast = i % 2 === 0;

      if (
        searchPast &&
        this.isSlotAvailable(beforeCursor, slotDuration, conflicts)
      ) {
        freeSlots.push({
          dateStart: beforeCursor.toDate(),
          dateEnd: beforeCursor.add(slotDuration, 'millisecond').toDate(),
        });
        beforeCursor = beforeCursor.subtract(slotDuration, 'millisecond');
      } else if (
        !searchPast &&
        this.isSlotAvailable(afterCursor, slotDuration, conflicts)
      ) {
        freeSlots.push({
          dateStart: afterCursor.toDate(),
          dateEnd: afterCursor.add(slotDuration, 'millisecond').toDate(),
        });
        afterCursor = afterCursor.add(slotDuration, 'millisecond');
      }

      i++;

      if (
        beforeCursor.isBefore(dayjs(0)) &&
        afterCursor.isAfter(dayjs().add(1, 'year'))
      ) {
        break;
      }
    }

    return freeSlots;
  }

  private isSlotAvailable(
    start: dayjs.Dayjs,
    slotDuration: number,
    conflicts: { dateStart: dayjs.Dayjs; dateEnd: dayjs.Dayjs }[]
  ): boolean {
    const slotEnd = start.add(slotDuration, 'millisecond');

    for (const conflict of conflicts) {
      if (
        start.isBefore(conflict.dateEnd) &&
        slotEnd.isAfter(conflict.dateStart)
      ) {
        return false;
      }
    }

    return true;
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
