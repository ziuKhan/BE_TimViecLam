import { PartialType } from '@nestjs/mapped-types';
import { CreateFIleDto } from './create-ﬁle.dto';

export class UpdateFIleDto extends PartialType(CreateFIleDto) {}
