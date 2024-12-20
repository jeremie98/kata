import { firstValueFrom, Observable } from 'rxjs';

const environmentStringForKataEnv = {
  DEV: 'development',
  STAGING: 'staging',
  PROD: 'production',
  TEST: 'test',
} as const;

type KataEnvValues = keyof typeof environmentStringForKataEnv;
type EnvironmentStringValues =
  (typeof environmentStringForKataEnv)[KataEnvValues];

const getEnvironmentStringFromKataEnv = (
  kataEnv: KataEnvValues
): EnvironmentStringValues =>
  environmentStringForKataEnv[kataEnv] ?? 'development';

const differenceBetweenTwoNumbers = (a: number, b: number) => {
  return Math.abs(a - b);
};

const getErrorMessage = (err: any) => {
  switch (true) {
    case err.hasOwnProperty('response') && err.response?.message !== undefined:
      return err.response.message;
    case err.hasOwnProperty('message'):
      return err.message;
    default:
      return err;
  }
};

const firstValueFromWithRetry = async <T>(
  source: Observable<T>,
  retriesOnConnectionLost = 3
): Promise<T> => {
  try {
    const result = await firstValueFrom<T, T>(source, {
      defaultValue: null as T,
    });
    return result;
  } catch (e: any) {
    if (
      e?.hasOwnProperty('message') === 'Connection closed' &&
      retriesOnConnectionLost > 0
    ) {
      return firstValueFromWithRetry<T>(source, retriesOnConnectionLost - 1);
    }
    throw e;
  }
};

const extractAccessTokenFromBearer = (bearerToken: string) =>
  bearerToken.replace(/^Bearer\s+/i, '');

export type { KataEnvValues, EnvironmentStringValues };

export * from './format';

export {
  getEnvironmentStringFromKataEnv,
  getErrorMessage,
  firstValueFromWithRetry,
  differenceBetweenTwoNumbers,
  extractAccessTokenFromBearer,
};
