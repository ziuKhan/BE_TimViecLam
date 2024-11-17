import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './Schemas/job.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  controllers: [JobsController],
  providers: [JobsService],

  exports: [JobsService],
})
export class JobsModule {}
