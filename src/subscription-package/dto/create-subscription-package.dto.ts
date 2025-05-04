import { IsNotEmpty, IsNumber, IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateSubscriptionPackageDto {
  @IsNotEmpty({ message: 'Tên gói không được để trống' })
  @IsString({ message: 'Tên gói phải là chuỗi ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Mã gói không được để trống' })
  @IsString({ message: 'Mã gói phải là chuỗi ký tự' })
  code: string;

  @IsNotEmpty({ message: 'Giá gói không được để trống' })
  @IsNumber({}, { message: 'Giá gói phải là số' })
  price: number;

  @IsNotEmpty({ message: 'Thời hạn không được để trống' })
  @IsNumber({}, { message: 'Thời hạn phải là số tháng' })
  duration: number;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description: string;

  @IsOptional()
  @IsArray({ message: 'Tính năng phải là mảng' })
  @IsString({ each: true, message: 'Mỗi tính năng phải là chuỗi ký tự' })
  features: string[];

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;
}
