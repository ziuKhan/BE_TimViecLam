import mongoose from 'mongoose';
import { CreateJobDto } from './create-job.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UpdateJobDto extends PartialType(CreateJobDto) {}
