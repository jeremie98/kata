import { EventType } from '@kata/prisma';
import { UserReturn } from './user';

export interface EventReturn {
  event_id: string;
  title: string;
  date_start: Date;
  date_end: Date;
  type: EventType;
  participants?: UserReturn[];
  created_at: Date;
  updated_at: Date;
}

export interface FetchEventsPlanningParams {
  dateStart: string;
  dateEnd: string;
}

export interface CreateUpdateEventParams {
  title: string;
  dateStart: string;
  dateEnd: string;
  participantIds: string[];
  type: EventType;
}

export interface DetectScheduleConflictsParams {
  dateStart: string;
  dateEnd: string;
  participantIds: string[];
}

export interface DetectScheduleConflictsResponse {
  user: UserReturn;
  conflictingEvents: EventReturn[];
}

export interface SuggestFreeCalendarSlotsResponse {
  dateStart: Date;
  dateEnd: Date;
}
