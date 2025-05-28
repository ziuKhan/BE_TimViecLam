import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './Schemas/notification.schema';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificationUser, NotificationUserSchema } from './Schemas/notificationUser.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }, { name: NotificationUser.name, schema: NotificationUserSchema }]),
    WebsocketsModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
