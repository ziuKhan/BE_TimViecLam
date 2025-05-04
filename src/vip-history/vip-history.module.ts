import { Module } from '@nestjs/common';
import { VipHistoryService } from './vip-history.service';
import { VipHistoryController } from './vip-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VipHistory, VipHistorySchema } from './schemas/vip-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VipHistory.name, schema: VipHistorySchema }
    ])
  ],
  controllers: [VipHistoryController],
  providers: [VipHistoryService],
  exports: [VipHistoryService]
})
export class VipHistoryModule {}
