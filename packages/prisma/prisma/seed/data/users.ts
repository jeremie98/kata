import { PrismaClient } from '@prisma/client';

export default async function createUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'johndoe@kata.com',
        password:
          '$2b$10$RJr8xxuAjYUwnXgZb4DSUeK9Ty5II3mLUXIsrfIZ7T62UJWAdBIHK', // Testtest2!
      },
      {
        firstname: 'Jeff',
        lastname: 'Bezos',
        email: 'jeffbezos@kata.com',
        password:
          '$2b$10$RJr8xxuAjYUwnXgZb4DSUeK9Ty5II3mLUXIsrfIZ7T62UJWAdBIHK', // Testtest2!
      },
      {
        firstname: 'Elon',
        lastname: 'Musk',
        email: 'elonmusk@kata.com',
        password:
          '$2b$10$RJr8xxuAjYUwnXgZb4DSUeK9Ty5II3mLUXIsrfIZ7T62UJWAdBIHK', // Testtest2!
      },
    ],
  });
}
