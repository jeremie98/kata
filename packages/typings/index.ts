/***** INTERFACES *****/

export * from './interfaces/api';
export * from './interfaces/authentication';
export * from './interfaces/user';
export * from './interfaces/event';

/***** PRISMA *****/

export { $Enums, EventType } from '@kata/prisma';
export type { User, Event, EventParticipant } from '@kata/prisma';

/***** NESTJS *****/

type FastifyReply = any;
type FastifyRequest = any;

export type { FastifyReply, FastifyRequest };
