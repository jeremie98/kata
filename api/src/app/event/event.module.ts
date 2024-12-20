import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  controllers: [EventController],
  providers: [EventService, NotificationsGateway],
  imports: [AuthModule],
})
export class EventModule {}
