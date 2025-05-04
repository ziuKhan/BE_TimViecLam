import { PartialType } from '@nestjs/swagger';
import { CreateVipHistoryDto } from './create-vip-history.dto';

export class UpdateVipHistoryDto extends PartialType(CreateVipHistoryDto) {}
