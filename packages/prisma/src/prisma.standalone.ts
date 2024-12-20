import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

export class PrismaStandalone {
  client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
    this.client.$connect();
  }
}
