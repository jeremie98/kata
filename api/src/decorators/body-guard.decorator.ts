import { SetMetadata } from '@nestjs/common';

export const BodyGuard = (...keys: string[]) => SetMetadata('keys', keys);
