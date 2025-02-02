import { EventType, PrismaClient } from '@prisma/client';
import dayjs from '@kata/day';

export default async function createEvents(prisma: PrismaClient) {
  await prisma.event.createMany({
    data: [
      {
        title: 'Event 1',
        date_start: dayjs().startOf('week').hour(14).minute(30).toDate(),
        date_end: dayjs().startOf('week').hour(17).minute(30).toDate(),
        type: EventType.PERSONAL,
      },
      {
        title: 'Event 2',
        date_start: dayjs().startOf('week').add(1, 'day').hour(9).toDate(),
        date_end: dayjs()
          .startOf('week')
          .add(1, 'day')
          .hour(11)
          .minute(30)
          .toDate(),
        type: EventType.PROJECT,
      },
      {
        title: 'Event 3',
        date_start: dayjs().startOf('week').add(2, 'day').hour(11).toDate(),
        date_end: dayjs()
          .startOf('week')
          .add(2, 'day')
          .hour(12)
          .minute(30)
          .toDate(),
        type: EventType.TEAM,
      },
    ],
  });
}
