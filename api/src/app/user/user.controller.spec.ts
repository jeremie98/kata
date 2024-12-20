import { Test, TestingModule } from '@nestjs/testing';
import { EventType, User } from '@kata/prisma';
import { AuthAtGuard } from '../../guards';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EventReturn, UserAccess } from '@kata/typings';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUsers: User[] = [
    {
      user_id: 'userid',
      email: 'example@email.com',
      firstname: 'firstname',
      lastname: 'lastname',
      password: '$2b$10$RJr8xxuAjYUwnXgZb8DSUeK9Ty5II4mLUXIsrfIZ7T62UJWAdBIHK',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  ];

  const mockUserAccess: UserAccess = {
    email: 'example@email.com',
    name: 'firstname lastname',
    userId: 'userid',
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

  const mockUserService = {
    fetchUserById: vi
      .fn()
      .mockImplementation(
        (id: string) => mockUsers.find((user) => user.user_id === id) || null
      ),
    fetchUserEvents: vi
      .fn()
      .mockResolvedValue(mockUserEvents)
      .mockImplementation((id: string) =>
        mockUserAccess.userId === id ? mockUserEvents : []
      ),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(AuthAtGuard)
      .useValue({})
      .compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('fetchOneById', () => {
    it('should return a specific user by id', async () => {
      const result = await userController.findCurrentUser(mockUserAccess);
      expect(result).toEqual(mockUsers[0]);
      expect(userService.fetchUserById).toHaveBeenCalledWith(
        mockUserAccess.userId
      );
    });

    it('should return null if user is not found', async () => {
      const userAccessNotFound = {
        email: 'xxxxx',
        name: 'xxx',
        userId: 'xxx',
      };
      const result = await userController.findCurrentUser(userAccessNotFound);
      expect(result).toBeNull();
      expect(userService.fetchUserById).toHaveBeenCalledWith(
        userAccessNotFound.userId
      );
    });
  });

  describe('fetchUserEvents', () => {
    it('should return all user events', async () => {
      const result = await userController.fetchUserEvents(mockUserAccess);
      expect(result).toEqual(mockUserEvents);
      expect(userService.fetchUserById).toHaveBeenCalledWith(
        mockUserAccess.userId
      );
    });

    it('should return empty array if there are no events', async () => {
      const result = await userController.fetchUserEvents({
        ...mockUserAccess,
        userId: 'xxx',
      });
      expect(result).toEqual([]);
      expect(userService.fetchUserById).toHaveBeenCalledWith('xxx');
    });
  });
});
