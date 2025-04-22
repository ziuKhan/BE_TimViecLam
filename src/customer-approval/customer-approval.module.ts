import { Module } from '@nestjs/common';
import { CustomerApprovalService } from './customer-approval.service';
import { CustomerApprovalController } from './customer-approval.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerApproval, CustomerApprovalSchema } from './schemas/customer-approval.schema';
import { User } from '../decorator/customize';
import { UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerApproval.name, schema: CustomerApprovalSchema },
      { name: User.name, schema: UserSchema },
      
    ]),
  ],
  controllers: [CustomerApprovalController],
  providers: [CustomerApprovalService],
})
export class CustomerApprovalModule {}
