import { Controller, Get, Query } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../decorator/customize';
@ApiTags('Websockets')
@Controller('websockets')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}

  @Public()
  @Get('is-user-connected')
  isUserConnected(@Query('userId') userId: string) {
    return this.websocketsService.isUserConnected(userId);
  }

  @Public()
  @Get('user-connection-count')
  getUserConnectionCount(@Query('userId') userId: string) {
    return this.websocketsService.getUserConnectionCount(userId);
  }

  @Public()
  @Get('connected-users')
  getConnectedUsers() {
    return this.websocketsService.getConnectedUsers();
  }
}
