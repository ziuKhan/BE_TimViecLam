import { PartialType } from '@nestjs/swagger';
import { CreateCustomerApprovalDto } from './create-customer-approval.dto';
import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCustomerApprovalDto extends PartialType(CreateCustomerApprovalDto) {

    @IsOptional()
    @IsString()
    reason: string;
}


export class CompanyDto {
    @IsNotEmpty({ message: 'ID không được để trống' })
    _id: string;
    @IsNotEmpty({ message: 'Tên công ty không được để trống' })
    name: string;
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    @IsArray({ message: 'Địa chỉ phải là mảng' })
    address: string[];
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;
    @IsNotEmpty({ message: 'Logo không được để trống' })
    logo: string;
    @IsNotEmpty({ message: 'Tỉnh thành phố không được để trống' })
    province: string;
    @IsNotEmpty({ message: 'Quận huyện không được để trống' })
    district: string;
    @IsNotEmpty({ message: 'Phường xã không được để trống' })
    ward: string;
    @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
    detailedAddress: string;
    @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
    fullAddress: string;
    @IsNotEmpty({ message: 'Quốc gia không được để trống' })
    country: string;
    @IsNotEmpty({ message: 'Loại công ty không được để trống' })
    type: string;
    @IsNotEmpty({ message: 'Số lượng nhân viên không được để trống' })
    size: string;
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    isActive: boolean;
    @IsNotEmpty({ message: 'Ngành nghề không được để trống' })
    industry: string;
    @IsNotEmpty({ message: 'Ngày làm việc không được để trống' })
    @IsArray({ message: 'Ngày làm việc phải là mảng' })
    workingDays: string[];
    @IsNotEmpty({ message: 'Chính sách làm thêm không được để trống' })
    overtimePolicy: string;
  }

  export class UpdateAcountSetupDto {
    @IsNotEmpty({ message: 'ID không được để trống' })
    _id: string;

    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    name: string;
  
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;
  
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
  
    @IsOptional()
    avatar: string;
  
    @IsOptional()
    gender: string;
  
    @IsNotEmpty({ message: 'Công ty không được để trống' })
    @IsObject()
    @Type(() => CompanyDto)
    company!: CompanyDto;
  }