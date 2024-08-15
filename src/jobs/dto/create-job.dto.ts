import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsObject,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên tuyển dụng' })
  @IsString({ message: 'Tên tuyển dụng phải là chuỗi ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Vui lòng nhập kỹ năng' })
  @IsArray({ message: 'Kỹ năng phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi kỹ năng phải là chuỗi ký tự' })
  skills: string[];

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về công ty' })
  @IsObject({ message: 'Thông tin công ty phải là một đối tượng' })
  company: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về địa điểm' })
  @IsString({ message: 'Địa điểm phải là chuỗi ký tự' })
  location: string;

  @IsNotEmpty({ message: 'Vui lòng điền thông tin về mức lương' })
  @IsNumber({}, { message: 'Mức lương phải là số' })
  salary: number;

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

  isActive: boolean;
}
