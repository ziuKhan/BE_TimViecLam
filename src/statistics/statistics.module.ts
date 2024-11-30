import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/Schemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService]
})
export class StatisticsModule {}
