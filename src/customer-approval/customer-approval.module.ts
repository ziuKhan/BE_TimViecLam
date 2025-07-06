import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesModule } from '../companies/companies.module';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { MailModule } from '../mail/mail.module';
import { Role, RoleSchema } from '../roles/Schemas/role.schema';
import { UsersModule } from '../users/users.module';
import { CustomerApprovalController } from './customer-approval.controller';
import { CustomerApprovalService } from './customer-approval.service';
import {
  CustomerApproval,
  CustomerApprovalSchema,
} from './schemas/customer-approval.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerApproval.name, schema: CustomerApprovalSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    UsersModule,
    ConfigModule,
    MailModule,
    CompaniesModule,
  ],
  controllers: [CustomerApprovalController],
  providers: [CustomerApprovalService],
})
export class CustomerApprovalModule {}
