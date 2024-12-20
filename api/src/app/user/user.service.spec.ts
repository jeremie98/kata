import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  EventParticipant,
  EventType,
  PrismaClient,
  PrismaModule,
  PrismaService,
  User,
} from '@kata/prisma';
import { UserNotFoundException } from '../../exceptions';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { EventReturn } from '@kata/typings';

describe('UserService', () => {
  let userService: UserService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockUser: User = {
    user_id: 'userid',
    email: 'example@email.com',
    firstname: 'firstname',
    lastname: 'lastname',
    password: '$2b$10$RJr8xxuAjYUwnXgZb8DSUeK9Ty5II4mLUXIsrfIZ7T62UJWAdBIHK',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockUserEvents: EventReturn[] = [
    {
      event_id: 'eventid',
      title: 'event test',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.PERSONAL,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      event_id: 'eventid3',
      title: 'event test',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.PROJECT,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockUserEventParticipants: (EventParticipant & {
    event?: EventReturn;
  })[] = [
    {
      event_participant_id: 'event_participant_id',
      event_id: 'eventid',
      user_id: 'userid',
      created_at: new Date(),
      updated_at: new Date(),
      event: mockUserEvents[0],
    },
    {
      event_participant_id: 'event_participant_id3',
      event_id: 'eventid3',
      user_id: 'userid',
      created_at: new Date(),
      updated_at: new Date(),
      event: mockUserEvents[1],
    },
  ];

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('when the fetchUserById function is called', () => {
    it('should return the user if exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.fetchUserById(mockUser.user_id);
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { user_id: mockUser.user_id, deleted_at: null },
        omit: {
          password: true,
          updated_at: true,
          deleted_at: true,
        },
      });
    });

    it('should throw the UserNotFoundException if user not exists', async () => {
      await expect(() => userService.fetchUserById('idevent')).rejects.toThrow(
        UserNotFoundException
      );
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { user_id: 'idevent', deleted_at: null },
        omit: {
          password: true,
          updated_at: true,
          deleted_at: true,
        },
      });
    });
  });

  describe('when the fetchUserEvents function is called', () => {
    it('should return all user events', async () => {
      prismaMock.eventParticipant.findMany.mockResolvedValue(
        mockUserEventParticipants
      );

      const result = await userService.fetchUserEvents(mockUser.user_id);
      expect(result).toEqual(mockUserEvents);
      expect(prismaMock.eventParticipant.findMany).toBeCalledTimes(1);
      expect(prismaMock.eventParticipant.findMany).toBeCalledWith({
        where: { user_id: mockUser.user_id },
        include: {
          event: true,
        },
      });
    });

    it('should return empty array if there are no events', async () => {
      prismaMock.eventParticipant.findMany.mockResolvedValue([]);

      const result = await userService.fetchUserEvents(mockUser.user_id);
      expect(result).toEqual([]);
      expect(prismaMock.eventParticipant.findMany).toBeCalledTimes(1);
      expect(prismaMock.eventParticipant.findMany).toBeCalledWith({
        where: { user_id: mockUser.user_id },
        include: {
          event: true,
        },
      });
    });
  });
});
