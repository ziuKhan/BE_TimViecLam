import { Module } from '@nestjs/common';
import { CustomerApprovalService } from './customer-approval.service';
import { CustomerApprovalController } from './customer-approval.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerApproval, CustomerApprovalSchema } from './schemas/customer-approval.schema';
import { User } from '../decorator/customize';
import { UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { Role, RoleSchema } from '../roles/Schemas/role.schema';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { CompaniesModule } from '../companies/companies.module';

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
