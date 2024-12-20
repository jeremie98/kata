import { PrismaClient } from '@prisma/client';
import { createEvents, createParticipants, createUsers } from './data';

export async function main() {
  const prisma = new PrismaClient();
  try {
    // Seeds needed to populate a new Database
    await baseSeeds(prisma);

    // Additional seeds used for testing
    await testSeeds(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export async function baseSeeds(prisma: PrismaClient) {}

async function testSeeds(prisma: PrismaClient) {
  await createUsers(prisma);
  await createEvents(prisma);
  await createParticipants(prisma);
}
