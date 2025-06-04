import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/Schemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { CustomerApproval, CustomerApprovalSchema } from '../customer-approval/schemas/customer-approval.schema';
import { RoleSchema } from '../roles/Schemas/role.schema';
import { SubscriptionPackage, SubscriptionPackageSchema } from '../subscription-package/schemas/subscription-package.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    MongooseModule.forFeature([{ name: CustomerApproval.name, schema: CustomerApprovalSchema }]),
    MongooseModule.forFeature([{ name: SubscriptionPackage.name, schema: SubscriptionPackageSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService]
})
export class StatisticsModule {}
