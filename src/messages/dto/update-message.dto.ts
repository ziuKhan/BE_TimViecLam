import { PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  lastMessageId?: mongoose.Schema.Types.ObjectId;
}

export class MarkAsReadDto {
  @IsMongoId()
  messageId: string;
}
