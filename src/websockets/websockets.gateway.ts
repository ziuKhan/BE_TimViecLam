import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { Server, Socket } from 'socket.io';
import { WebsocketsService } from './websockets.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { Body } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'websockets',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})

export class WebsocketsGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly websocketsService: WebsocketsService) {}

  @SubscribeMessage('websockets')
  async sendNotificationToAllUsers(@MessageBody() notification: string, @MessageBody() event: string) {
    return this.server.emit(event, notification);
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.websocketsService.handleUserConnection(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.websocketsService.handleUserDisconnection(userId, client);
    }
  }

  @SubscribeMessage('notification')
  sendNotificationToUser(
    @Body() createWebsocketDto: CreateWebsocketDto
  ) {
    return this.websocketsService.sendNotificationToUser(
      createWebsocketDto
    );
  }


}
