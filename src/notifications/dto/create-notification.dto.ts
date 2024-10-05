import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsObject,
  IsNumber,
  IsDate,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tiêu đề thông báo' })
  @IsString({ message: 'Tên tuyển dụng phải là chuỗi ký tự' })
  title: string;

  @IsNotEmpty({ message: 'Vui lòng nhập nội dùng thông báo' })
  @IsString({  message: 'Nội dùng thông báo phải là chuỗi ký tự' })
  message: string;

  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Vui lòng nhập type' })
  @IsString({ message: 'Tên type phải là chuỗi ký tự' })
  type: string;
 
  @IsNotEmpty({ message: 'Vui lòng nhập url' })
  @IsString({ message: 'Tên url phải là chuỗi ký tự' })
  url: string;

  @IsBoolean()
  isRead: boolean;
}
