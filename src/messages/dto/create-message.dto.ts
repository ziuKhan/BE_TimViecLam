import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum,  IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";


export class CreateMessageDto {
    @IsEnum(['text', 'file', 'image', 'system'])
    @ApiProperty({ enum: ['text', 'file', 'image', 'system'] })
    contentType: 'text' | 'file' | 'image' | 'system';

    @IsOptional()
    @IsString()
    conversationId: string;

    @IsOptional()
    @IsString()
    senderId: string;

    @IsOptional()
    @IsString()
    textContent: string;

    @IsOptional()
    @IsString()
    file_name: string;

    @IsOptional()
    @IsNumber()
    file_size: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    statusByRecipient: string[];
}


export class CreateConversationDto {
    @IsOptional()
    @IsString()
    conversationName: string;

    @IsArray()
    @IsString({ each: true })
    userId: string[];

    @IsObject()
    message: CreateMessageDto;
}

export class CheckOneToOneConversationDto {
    @IsString()
    @ApiProperty({ description: 'ID của người dùng khác để kiểm tra hội thoại 1-1' })
    otherUserId: string;
}