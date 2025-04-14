import mongoose from 'mongoose';
import { CreateJobDto } from './create-job.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
}
