import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptor/logger.interceptor';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { EventModule } from './app/event/event.module';
import { NotificationsModule } from './app/notifications/notifications.module';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    EventModule,
    NotificationsModule,
  ],
})
export class AppModule {}
