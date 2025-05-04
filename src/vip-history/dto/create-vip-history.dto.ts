import { IsNotEmpty, IsMongoId, IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVipHistoryDto {
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @IsMongoId({ message: 'ID người dùng không hợp lệ' })
  userId: string;

  @IsNotEmpty({ message: 'ID gói không được để trống' })
  @IsMongoId({ message: 'ID gói không hợp lệ' })
  packageId: string;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
  startDate: Date;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
  endDate: Date;

  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  status: string;

  @IsNotEmpty({ message: 'ID giao dịch không được để trống' })
  @IsMongoId({ message: 'ID giao dịch không hợp lệ' })
  transactionId: string;
}
