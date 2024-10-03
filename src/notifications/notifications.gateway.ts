import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  namespace: 'notifications',
  cors: {
      origin: [
          'http://localhost:3000',
          'http://localhost:5000',
          'https://viecjob.vercel.app',
      ],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()  server: Server;
  constructor(private readonly notificationsService: NotificationsService) {}



  @SubscribeMessage('notification')
  async sendNotificationToAllUsers(notification: any) {
    return this.server.emit('notification', notification);
  }
  


}
