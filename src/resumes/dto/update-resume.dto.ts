import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import mongoose from 'mongoose';

export class UpdateResumeDto {
  email: string;
  userId: mongoose.Schema.Types.ObjectId;
  url: string;
  status: string;
  companyId: mongoose.Schema.Types.ObjectId;
  jobId: mongoose.Schema.Types.ObjectId;
}
