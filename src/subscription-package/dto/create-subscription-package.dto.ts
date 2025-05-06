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

  @IsNotEmpty({ message: 'Giá gói khuyến mãi không được để trống' })
  @IsNumber({}, { message: 'Giá gói khuyến mãi phải là số' })
  priceDiscount: number;

  @IsNotEmpty({ message: 'Thời hạn không được để trống' })
  @IsNumber({}, { message: 'Thời hạn phải là số tháng' })
  duration: number;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;
}
