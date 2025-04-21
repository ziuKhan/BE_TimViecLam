import { Module } from '@nestjs/common';
import { CustomerApprovalService } from './customer-approval.service';
import { CustomerApprovalController } from './customer-approval.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerApproval, CustomerApprovalSchema } from './schemas/customer-approval.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerApproval.name, schema: CustomerApprovalSchema },
    ]),
  ],
  controllers: [CustomerApprovalController],
  providers: [CustomerApprovalService],
})
export class CustomerApprovalModule {}
