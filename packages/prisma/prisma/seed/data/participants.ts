import { PrismaClient } from '@prisma/client';

export default async function createEventParticipants(prisma: PrismaClient) {
  const johnDoe = await prisma.user.findUnique({
    where: { email: 'johndoe@kata.com' },
  });
  const jeffBezos = await prisma.user.findUnique({
    where: { email: 'jeffbezos@kata.com' },
  });
  const elonMusk = await prisma.user.findUnique({
    where: { email: 'elonmusk@kata.com' },
  });

  const event1 = await prisma.event.findFirst({ where: { title: 'Event 1' } });
  const event2 = await prisma.event.findFirst({ where: { title: 'Event 2' } });
  const event3 = await prisma.event.findFirst({ where: { title: 'Event 3' } });

  await prisma.eventParticipant.createMany({
    data: [
      { event_id: event1?.event_id!, user_id: johnDoe?.user_id! },
      { event_id: event1?.event_id!, user_id: jeffBezos?.user_id! },
      { event_id: event2?.event_id!, user_id: elonMusk?.user_id! },
      { event_id: event2?.event_id!, user_id: jeffBezos?.user_id! },
      { event_id: event3?.event_id!, user_id: johnDoe?.user_id! },
      { event_id: event3?.event_id!, user_id: jeffBezos?.user_id! },
    ],
  });
}
