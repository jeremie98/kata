'use server';

import { fetchWithCredentials } from '@/utils';
import {
  ApiResponse,
  CreateUpdateEventParams,
  DetectScheduleConflictsParams,
  DetectScheduleConflictsResponse,
  EventReturn,
  UserReturn,
} from '@kata/typings';

export async function fetchProfile(): Promise<ApiResponse<UserReturn>> {
  try {
    return await fetchWithCredentials('users', {
      method: 'GET',
      cache: 'no-store',
    });
  } catch (err) {
    return {
      data: null,
      success: false,
    };
  }
}

export async function fetchParticipants(): Promise<ApiResponse<UserReturn[]>> {
  try {
    return await fetchWithCredentials('users/participants', {
      method: 'GET',
    });
  } catch (err) {
    return {
      data: null,
      success: false,
    };
  }
}

export async function fetchEvents(): Promise<ApiResponse<EventReturn[]>> {
  try {
    return await fetchWithCredentials('users/events', {
      method: 'GET',
      cache: 'no-store',
    });
  } catch (err) {
    return {
      data: [],
      success: false,
    };
  }
}

export async function createEvent(
  body: CreateUpdateEventParams
): Promise<ApiResponse<EventReturn>> {
  try {
    return await fetchWithCredentials('events', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      data: null,
      success: false,
    };
  }
}

export async function updateEvent(
  idEvent: string,
  body: CreateUpdateEventParams
): Promise<ApiResponse<EventReturn>> {
  try {
    return await fetchWithCredentials(`events/${idEvent}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      data: null,
      success: false,
    };
  }
}

export async function deleteEvent(
  idEvent: string
): Promise<ApiResponse<boolean>> {
  try {
    return await fetchWithCredentials(`events/${idEvent}`, {
      method: 'DELETE',
    });
  } catch (err) {
    return {
      data: null,
      success: false,
    };
  }
}

export async function checkEventConflicts(
  body: DetectScheduleConflictsParams
): Promise<ApiResponse<DetectScheduleConflictsResponse[]>> {
  try {
    return await fetchWithCredentials('events/detect-conflicts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      data: [],
      success: false,
    };
  }
}
