import { Module } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { WebsocketsGateway } from './websockets.gateway';
import { WebsocketsController } from './websockets.controller';

@Module({
  exports: [WebsocketsGateway],
  controllers: [WebsocketsController],
  providers: [WebsocketsGateway, WebsocketsService]
})
export class WebsocketsModule {}
