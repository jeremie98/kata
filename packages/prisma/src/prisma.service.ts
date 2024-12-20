import {
  INestApplication,
  INestMicroservice,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({});
  }

  async onModuleInit() {
    let attemps_left = 5;

    while (attemps_left) {
      try {
        await this.$connect();
        attemps_left = 0;
      } catch (err) {
        attemps_left--;
        if (attemps_left === 0) throw err;
      }
    }

    if (process.env.KATA_ENV === 'PROD') {
      this.$on('query' as never, (event: any) => {
        console.log(
          `Query: ${event.query}. Params: ${event.params}. 'Duration: ' ${event.duration}ms`
        );
      });
    }
  }

  // async enableShutdownHooks(app: INestApplication | INestMicroservice) {
  //   process.on('beforeExit' as never, async () => {
  //     await app.close();
  //   });
  // }

  /**
   * Override $queryRaw to convert Prisma.Decimal to number
   * Works exactly like $queryRaw
   */
  async $kataQueryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Promise<T> {
    // function to recursively convert Prisma.Decimal to number
    const convertPrismaDecimalToNumber = (obj: any): any => {
      if (obj instanceof Prisma.Decimal) {
        // convert if instance of Prisma.Decimal
        return obj.toNumber();
      } else if (typeof obj === 'bigint') {
        // convert if instance of BigInt
        return Number(obj);
      } else if (obj instanceof Date) {
        // convert if instance of Date
        return obj.toISOString();
      } else if (Array.isArray(obj)) {
        // call recursively on array
        return obj.map(convertPrismaDecimalToNumber);
      } else if (typeof obj === 'object' && obj !== null) {
        // call recursively for each object values
        const convertedObj: any = {};
        for (const key in obj) {
          convertedObj[key] = convertPrismaDecimalToNumber(obj[key]);
        }
        return convertedObj;
      }
      return obj;
    };

    // Call prisma $queryRaw
    const res = await this.$queryRaw<T>(query, ...values);
    // Initiate recursive conversion
    const convertedRes = convertPrismaDecimalToNumber(res);
    return convertedRes as T;
  }

  // Used to wrap prisma update to catch error on record not found
  async recoverFromNotFound<T>(promise: Promise<T>): Promise<T | null> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          return null;
        }
      }
      throw e;
    }
  }
}
