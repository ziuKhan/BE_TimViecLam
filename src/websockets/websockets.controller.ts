import { Controller, Get, Query } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Websockets')
@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}

  @Get('is-user-connected')
  isUserConnected(@Query('userId') userId: string) {
    return this.websocketsService.isUserConnected(userId);
  }

  @Get('user-connection-count')
  getUserConnectionCount(@Query('userId') userId: string) {
    return this.websocketsService.getUserConnectionCount(userId);
  }

  @Get('connected-users')
  getConnectedUsers() {
    return this.websocketsService.getConnectedUsers();
  }
}
