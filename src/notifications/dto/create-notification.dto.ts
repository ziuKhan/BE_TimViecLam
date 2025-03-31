import {
    IsNotEmpty,
    IsString,
    IsBoolean,
    IsMongoId,
    ValidateNested,
    IsOptional,
    IsDate,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class ObjInfoDto {
    @IsOptional()
    @IsString({ message: 'Mã phải là chuỗi ký tự' })
    _id: string; 

    @IsOptional()
    @IsNotEmpty({ message: 'Vui lòng nhập loại đối tượng' })
    @IsString({ message: 'Loại đối tượng phải là chuỗi ký tự' })
    type: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Vui lòng nhập tên đối tượng' })
    @IsString({ message: 'Tên đối tượng phải là chuỗi ký tự' })
    name: string;
}


export class CreateNotificationDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Vui lòng nhập tiêu đề thông báo' })
    @IsString({ message: 'Tên tuyển dụng phải là chuỗi ký tự' })
    title: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Vui lòng nhập nội dung thông báo' })
    @IsString({ message: 'Nội dung thông báo phải là chuỗi ký tự' })
    message: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Vui lòng nhập type' })
    @IsString({ message: 'Tên type phải là chuỗi ký tự' })
    type: string;

    @IsOptional()
    @IsBoolean({message: 'isGlobal phải là true hoặc false'})
    isGlobal: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => ObjInfoDto)
    objInfo: ObjInfoDto;

    @IsOptional()
    @IsMongoId({ each: true, message: 'UserId không hợp lệ' })
    @IsArray()
    userIds: mongoose.Schema.Types.ObjectId[];
}