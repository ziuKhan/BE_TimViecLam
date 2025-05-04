import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
  IsMongoId,
  IsNumber,
  IsArray,
} from 'class-validator';
import mongoose from 'mongoose';

// Định nghĩa class cho socialLink
class ItemDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name: string;

  @IsOptional()
  @ApiProperty()
  quantity: number;

  @IsOptional()
  @ApiProperty()
  price: number;
}

export class CreateTransactionDto {
  @IsOptional()
  @ApiProperty()
  isAnonymous: boolean;

  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @ApiProperty()
  amount: number;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @ApiProperty()
  description: string;

  @IsString({message: 'Tên người mua phải là chuỗi ký tự'})
  @IsOptional()
  @ApiProperty()
  buyerName: string;

  @IsEmail({}, { message: 'Email không hợp lệ a@a.a' })
  @IsOptional()
  @ApiProperty()
  buyerEmail: string;

  @IsString({message: 'Địa chỉ phải là chuỗi ký tự'})
  @IsOptional()
  @ApiProperty()
  buyerAddress: string;

  @IsNotEmpty({ message: 'URL hủy không được để trống' })
  @IsString({message: 'URL hủy phải là chuỗi ký tự'})
  @ApiProperty()
  @IsOptional()
  cancelUrl: string;

  @IsNotEmpty({ message: 'URL trả về không được để trống' })
  @IsString({message: 'URL trả về phải là chuỗi ký tự'})
  @ApiProperty()
  @IsOptional()
  returnUrl: string;

  @IsNotEmpty({ message: 'Thời gian hết hạn không được để trống' })
  @ApiProperty()
  @IsOptional()
  expiredAt: number;

  @IsNotEmpty({ message: 'Chữ ký không được để trống' })
  @IsString({message: 'Chữ ký phải là chuỗi ký tự'})
  @ApiProperty()  
  @IsOptional()
  signature: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsOptional()
  @IsString({ message: 'Loại giao dịch phải là chuỗi ký tự' })
  type: string;

  @IsOptional()
  @IsMongoId({ message: 'ID gói không hợp lệ' })
  packageId: string;
}
