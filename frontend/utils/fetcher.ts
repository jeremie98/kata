import { auth } from '@/auth';
import { ApiResponse } from '@kata/typings';

export async function fetchWithCredentials<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, data: null, message: 'Session not valid' };
    }

    return makeFetch<ApiResponse<T>>(path, session?.tokens.accessToken, init);
  } catch (err) {
    return { success: false, data: null, message: err };
  }
}

export async function fetchWithoutCredentials<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    return makeFetch<ApiResponse<T>>(path, undefined, init);
  } catch (err) {
    return { success: false, data: null, message: err };
  }
}

function makeFetch<T>(
  path: string,
  accessToken?: string,
  init?: RequestInit
): Promise<T> {
  return fetch(`${process.env.API_KATA}/api/${path}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    ...init,
  }).then((res) => res.json());
}
