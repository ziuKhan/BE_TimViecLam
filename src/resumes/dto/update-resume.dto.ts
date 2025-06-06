import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import mongoose from 'mongoose';
import { IsOptional, IsString } from 'class-validator';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {

}
