import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  CreateUpdateEventDto,
  DetectScheduleConflictsParamsDto,
} from './event.dto';
import { EventType } from '@kata/prisma';
import dayjs from '@kata/day';
import { AuthAtGuard } from '../../guards';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../app.module';
import { APP_GUARD } from '@nestjs/core';
import { SignInDto } from '../auth/auth.dto';
import { LoginReturn } from '@kata/typings';

class MockAuthAtGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

async function loginUser(
  app: NestFastifyApplication,
  loginDto: SignInDto
): Promise<LoginReturn> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: loginDto,
  });

  return res.json();
}

describe('EventController (e2e)', () => {
  let app: NestFastifyApplication;
  let loggedUser: LoginReturn;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: APP_GUARD,
          useExisting: AuthAtGuard,
        },
        AuthAtGuard,
      ],
    })
      .overrideProvider(AuthAtGuard)
      .useClass(MockAuthAtGuard)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    loggedUser = await loginUser(app, {
      email: 'johndoe@kata.com',
      password: 'Testtest2!',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[POST] /events', () => {
    it('should create a new event', async () => {
      const createDto: CreateUpdateEventDto = {
        title: 'new event',
        dateStart: '2024-10-25 10:00:00',
        dateEnd: '2024-10-25 11:00:00',
        participantIds: [loggedUser.user.userId],
        type: EventType.PERSONAL,
      };

      const result = await app.inject({
        method: 'POST',
        url: '/events',
        payload: createDto,
        headers: {
          authorization: `Bearer ${loggedUser.tokens.accessToken}`,
        },
      });

      expect(result.statusCode).toBe(201);
      expect(result.json()).toHaveProperty('event_id');
      expect(result.json().title).toEqual(createDto.title);
      expect(dayjs(result.json().date_start).toDate()).toEqual(
        dayjs(createDto.dateStart).toDate()
      );
      expect(result.json().type).toEqual(createDto.type);
    });
  });

  describe('[POST] /events/detect-conflicts', () => {
    it('should detect schedule conflicts for participants', async () => {
      const detectConflictsDto: DetectScheduleConflictsParamsDto = {
        dateStart: '2024-10-25 10:00:00',
        dateEnd: '2024-10-25 11:00:00',
        participantIds: [loggedUser.user.userId],
      };

      const result = await app.inject({
        method: 'POST',
        url: '/events/detect-conflicts',
        payload: detectConflictsDto,
        headers: {
          authorization: `Bearer ${loggedUser.tokens.accessToken}`,
        },
      });

      expect(result.statusCode).toBe(201);
      expect(result.json()).toBeInstanceOf(Array);
      expect(result.json()).toHaveLength(1);
      expect(result.json()[0]).toHaveProperty('user');
      expect(result.json()[0]).toHaveProperty('conflictingEvents');
      expect(result.json()[0].user.user_id).toEqual(loggedUser.user.userId);
    });
  });
});
