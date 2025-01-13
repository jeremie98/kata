import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import {
  EventParticipant,
  EventType,
  PrismaClient,
  PrismaService,
} from '@kata/prisma';
import { EventNotFoundException } from '../../exceptions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { CreateUpdateEventDto } from './event.dto';
import dayjs from '@kata/day';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventReturn, UserReturn } from '@kata/typings';

describe('EventService', () => {
  let eventService: EventService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockEvents: EventReturn[] = [
    {
      event_id: 'eventid',
      title: 'event test',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.PERSONAL,
      participants: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      event_id: 'eventid3',
      title: 'event test',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.PROJECT,
      participants: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const newEventDto: CreateUpdateEventDto = {
    title: 'new event created',
    dateStart: '2024-12-24 10:30:00',
    dateEnd: '2024-12-24 11:30:00',
    type: EventType.PROJECT,
    participantIds: ['userid'],
  };

  const mockUserEventParticipants: (EventParticipant & {
    event?: EventReturn;
    user?: UserReturn;
  })[] = [
    {
      event_participant_id: 'event_participant_id',
      event_id: 'eventid',
      user_id: 'userid',
      created_at: new Date(),
      updated_at: new Date(),
      event: mockEvents[0],
      user: {
        user_id: 'userid',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        created_at: new Date(),
      },
    },
    {
      event_participant_id: 'event_participant_id3',
      event_id: 'eventid3',
      user_id: 'userid',
      created_at: new Date(),
      updated_at: new Date(),
      event: mockEvents[1],
      user: {
        user_id: 'userid',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        created_at: new Date(),
      },
    },
  ];

  const mockConflictsEventParticipants = [
    {
      user: {
        user_id: 'userid',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        created_at: expect.any(Date),
      },
      conflictingEvents: [
        {
          event_id: 'eventid',
          title: 'Meeting',
          date_start: new Date('2024-12-19T10:00:00Z'),
          date_end: new Date('2024-12-19T11:00:00Z'),
          type: EventType.PERSONAL,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    },
    {
      user: {
        user_id: 'userid2',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        created_at: new Date(),
      },
      conflictingEvents: [
        {
          event_id: 'eventid2',
          title: 'Workshop',
          date_start: new Date('2024-12-19T10:30:00Z'),
          date_end: new Date('2024-12-19T12:00:00Z'),
          type: EventType.PROJECT,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    },
  ];

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        NotificationsGateway,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    eventService = module.get<EventService>(EventService);
  });

  describe('when the fetchOneById function is called', () => {
    it('should return the event if exists', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvents[0]);

      const result = await eventService.fetchOneById(mockEvents[0].event_id);
      expect(result).toEqual(mockEvents[0]);
      expect(prismaMock.event.findUnique).toBeCalledTimes(1);
      expect(prismaMock.event.findUnique).toBeCalledWith({
        where: { event_id: mockEvents[0].event_id },
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
    });

    it('should throw the EventNotFoundException if event not exists', async () => {
      await expect(() => eventService.fetchOneById('idevent')).rejects.toThrow(
        EventNotFoundException
      );
      expect(prismaMock.event.findUnique).toBeCalledTimes(1);
      expect(prismaMock.event.findUnique).toBeCalledWith({
        where: { event_id: 'idevent' },
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
    });
  });

  describe('when the createEvent function is called', () => {
    it('it should create successfully event in database and return it', async () => {
      prismaMock.event.create.mockResolvedValue(mockEvents[1]);
      prismaMock.eventParticipant.findMany.mockResolvedValue([]);

      const result = await eventService.createEvent(newEventDto);
      expect(result).toEqual(mockEvents[1]);
      expect(prismaMock.event.create).toBeCalledTimes(1);
      expect(prismaMock.event.create).toBeCalledWith({
        data: {
          title: newEventDto.title,
          date_start: dayjs(
            newEventDto.dateStart,
            'YYYY-MM-DD HH:mm:ss'
          ).toDate(),
          date_end: dayjs(newEventDto.dateEnd, 'YYYY-MM-DD HH:mm:ss').toDate(),
          type: newEventDto.type,
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
    });
  });

  describe('when the updateEvent function is called', () => {
    it('it should update sucessfully event in database and return it', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvents[1]);
      prismaMock.event.update.mockResolvedValue({
        ...mockEvents[1],
        event_id: 'eventid4',
        title: 'event test updated',
      });

      const result = await eventService.updateEvent(
        mockEvents[1].event_id,
        newEventDto
      );
      expect(result).not.toEqual(mockEvents[1]);
      expect(prismaMock.event.update).toBeCalledTimes(1);
      expect(prismaMock.event.update).toBeCalledWith({
        where: { event_id: mockEvents[1].event_id },
        data: {
          title: newEventDto.title,
          date_start: dayjs(
            newEventDto.dateStart,
            'YYYY-MM-DD HH:mm:ss'
          ).toDate(),
          date_end: dayjs(newEventDto.dateEnd, 'YYYY-MM-DD HH:mm:ss').toDate(),
          type: newEventDto.type,
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
    });
  });

  describe('when the deleteEvent function is called', () => {
    it('it should delete sucessfully event in database and return true', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvents[1]);

      const result = await eventService.deleteEvent(mockEvents[1].event_id);
      expect(result).not.toEqual(true);
      expect(prismaMock.event.delete).toBeCalledTimes(1);
      expect(prismaMock.event.delete).toBeCalledWith({
        where: { event_id: mockEvents[1].event_id },
      });
    });
  });

  describe('when the detectScheduleConflicts function is called', () => {
    it('should return conflicts if there are any', async () => {
      prismaMock.eventParticipant.findMany.mockResolvedValue(
        mockUserEventParticipants
      );
      vi.spyOn(eventService, 'detectScheduleConflicts').mockResolvedValue(
        mockConflictsEventParticipants
      );

      const result = await eventService.detectScheduleConflicts({
        dateStart: '2024-12-24 10:30:00',
        dateEnd: '2024-12-24 11:30:00',
        participantIds: ['userId1'],
      });

      expect(result).toEqual(mockConflictsEventParticipants);
    });

    it('should return an empty array if there are no conflicts', async () => {
      prismaMock.eventParticipant.findMany.mockResolvedValue([]);

      const result = await eventService.detectScheduleConflicts({
        dateStart: '2024-12-24 10:30:00',
        dateEnd: '2024-12-24 11:30:00',
        participantIds: ['userId1'],
      });

      expect(result).toEqual([]);
      expect(prismaMock.eventParticipant.findMany).toBeCalledTimes(1);
      expect(prismaMock.eventParticipant.findMany).toBeCalledWith({
        where: {
          user_id: { in: ['userId1'] },
          event: {
            OR: [
              {
                date_start: {
                  lte: dayjs(
                    '2024-12-24 11:30:00',
                    'YYYY-MM-DD HH:mm:ss'
                  ).toDate(),
                },
                date_end: {
                  gte: dayjs(
                    '2024-12-24 10:30:00',
                    'YYYY-MM-DD HH:mm:ss'
                  ).toDate(),
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
    });
  });
});
