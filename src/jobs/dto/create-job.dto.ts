import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsObject,
  IsNumber,
  IsDate,
  IsBoolean,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên tuyển dụng' })
  @IsString({ message: 'Tên tuyển dụng phải là chuỗi ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Vui lòng nhập kỹ năng' })
  @IsArray({ message: 'Kỹ năng phải là một mảng' })
  @IsMongoId({ each: true, message: 'Mỗi kỹ năng phải là ID' })
  skills: mongoose.Schema.Types.ObjectId[];

  @IsNotEmpty({ message: 'Vui lòng điền companyId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về địa điểm' })
  @IsString({ message: 'Địa điểm phải là chuỗi ký tự' })
  location: string;

  @IsOptional()
  @IsNumber({}, { message: 'Mức lương từ phải là số' })
  salaryFrom: number;

  @IsOptional()
  @IsNumber({}, { message: 'Mức lương đến phải là số' })
  salaryTo: number;

  @IsOptional()
  @IsBoolean({ message: 'Mức lương phải là boolean' })
  isSalary: boolean;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về số lượng tuyển dụng' })
  @IsNumber({}, { message: 'Số lượng tuyển dụng phải là số' })
  quantity: number;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về trình độ' })
  @IsString({ message: 'Trình độ phải là chuỗi ký tự' })
  level: string;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về mô tả công việc' })
  @IsString({ message: 'Mô tả công việc phải là chuỗi ký tự' })
  description: string;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về thời gian bắt đầu' })
  @IsDate({ message: 'Thời gian bắt đầu phải là ngày tháng hợp lệ' })
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về thời gian kết thúc' })
  @IsDate({ message: 'Thời gian kết thúc phải là ngày tháng hợp lệ' })
  @Type(() => Date)
  endDate: Date;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về trạng thái' })
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive: boolean;
}
