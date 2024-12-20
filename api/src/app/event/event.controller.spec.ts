import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventType, PrismaModule } from '@kata/prisma';
import { AuthAtGuard } from '../../guards';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CreateUpdateEventDto,
  DetectScheduleConflictsParamsDto,
} from './event.dto';
import { AuthModule } from '../auth/auth.module';
import { EventReturn } from '@kata/typings';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;

  const mockEvents: EventReturn[] = [
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
      event_id: 'eventid2',
      title: 'event test 2',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.TEAM,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      event_id: 'eventid3',
      title: 'event test 3',
      date_start: new Date(),
      date_end: new Date(),
      type: EventType.PROJECT,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const newEventDto: CreateUpdateEventDto = {
    title: 'event created',
    dateStart: '2024-12-24 10:30:00',
    dateEnd: '2024-12-24 11:30:00',
    type: EventType.PROJECT,
    participantIds: [''],
  };

  const conflictDto: DetectScheduleConflictsParamsDto = {
    participantIds: ['participant1', 'participant2'],
    dateStart: '2024-12-24 10:30:00',
    dateEnd: '2024-12-24 11:30:00',
  };

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

  const mockEventService = {
    findAll: vi.fn().mockResolvedValue(mockEvents),
    fetchOneById: vi
      .fn()
      .mockImplementation(
        (id: string) =>
          mockEvents.find((event) => event.event_id === id) || null
      ),
    createEvent: vi.fn().mockImplementation((dto) => ({
      event_id: 'eventid3',
      ...dto,
    })),
    updateEvent: vi.fn().mockImplementation((id, dto) => ({
      event_id: id,
      ...dto,
    })),
    deleteEvent: vi.fn().mockResolvedValue(true),
    addParticipants: vi.fn().mockImplementation((id, dto) => ({
      event_id: id,
      ...dto,
    })),
    removeParticipants: vi.fn().mockImplementation((id, dto) => ({
      event_id: id,
      ...dto,
    })),
    detectScheduleConflicts: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
      imports: [PrismaModule, AuthModule],
    })
      .overrideGuard(AuthAtGuard)
      .useValue({})
      .compile();

    eventController = moduleRef.get<EventController>(EventController);
    eventService = moduleRef.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(eventController).toBeDefined();
  });

  describe('fetchOneById', () => {
    it('should return a specific event by id', async () => {
      const result = await eventController.fetchOneById('eventid');
      expect(result).toEqual(mockEvents[0]);
      expect(eventService.fetchOneById).toHaveBeenCalledWith('eventid');
    });

    it('should return null if event is not found', async () => {
      const result = await eventController.fetchOneById('99');
      expect(result).toBeNull();
      expect(eventService.fetchOneById).toHaveBeenCalledWith('99');
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const result = await eventController.createEvent(newEventDto);
      expect(result).toEqual({ event_id: 'eventid3', ...newEventDto });
      expect(eventService.createEvent).toHaveBeenCalledWith(newEventDto);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const result = await eventController.updateEvent('eventid3', newEventDto);
      expect(result).toEqual({ event_id: 'eventid3', ...newEventDto });
      expect(eventService.updateEvent).toHaveBeenCalledWith(
        'eventid3',
        newEventDto
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const result = await eventController.deleteEvent('eventid3');
      expect(result).toBe(true);
      expect(eventService.deleteEvent).toHaveBeenCalledWith('eventid3');
    });
  });

  describe('addParticipants', () => {
    it('should add participants to an event', async () => {
      const addDto = { participantIds: ['participant1', 'participant2'] };
      const result = await eventController.addParticipants('eventid3', addDto);
      expect(result).toEqual({ event_id: 'eventid3', ...addDto });
      expect(eventService.addParticipants).toHaveBeenCalledWith(
        'eventid3',
        addDto
      );
    });
  });

  describe('removeParticipants', () => {
    it('should remove participants from an event', async () => {
      const removeDto = { participantIds: ['participant1'] };
      const result = await eventController.removeParticipants(
        'eventid3',
        removeDto
      );
      expect(result).toEqual({ event_id: 'eventid3', ...removeDto });
      expect(eventService.removeParticipants).toHaveBeenCalledWith(
        'eventid3',
        removeDto
      );
    });
  });

  describe('detectScheduleConflicts', () => {
    it('should detect schedule conflicts for participants', async () => {
      eventService.detectScheduleConflicts = vi
        .fn()
        .mockResolvedValue(mockConflictsEventParticipants);
      const result = await eventController.detectScheduleConflicts(conflictDto);
      expect(result).toEqual(mockConflictsEventParticipants);
      expect(eventService.detectScheduleConflicts).toHaveBeenCalledWith(
        conflictDto
      );
    });

    it('should return an empty array if there are no conflicts', async () => {
      eventService.detectScheduleConflicts = vi.fn().mockResolvedValue([]);
      const result = await eventController.detectScheduleConflicts(conflictDto);
      expect(result).toEqual([]);
      expect(eventService.detectScheduleConflicts).toHaveBeenCalledWith(
        conflictDto
      );
    });
  });
});
