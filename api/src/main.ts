import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import { contentParser } from 'fastify-file-interceptor';
import { ExceptionFilter } from './exception-filter';
import {
  TransformInterceptor,
  ErrorInterceptor,
} from './interceptor/response.interceptor';
import { ValidationPipe } from './validation-pipe';
import { Logger } from './logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function main() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4071;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 8000000 }), // 8MB
    { logger: ['error', 'warn', 'debug', 'verbose'], rawBody: true }
  );
  await app.register(fastifyHelmet);
  await app.register(contentParser);

  app.enableCors();
  app.useGlobalFilters(new ExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new ErrorInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  new Logger(process.env.NAME_APP as string).log(
    `Service ${process.env.NAME_APP} is listening PORT : ${port}`
  );

  const config = new DocumentBuilder()
    .setTitle('Kata API Admin')
    .setDescription('Kata API Admin description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port, '0.0.0.0');
}

main();
