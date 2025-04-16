import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;
  @IsNotEmpty({ message: 'address không được để trống' })
  @IsArray({ message: 'address phải là mảng' })
  address: string[];
  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;
  @IsNotEmpty({ message: 'logo không được để trống' })
  logo: string;
  @IsNotEmpty({ message: 'province không được để trống' })
  province: string;
  @IsNotEmpty({ message: 'district không được để trống' })
  district: string;
  @IsNotEmpty({ message: 'ward không được để trống' })
  ward: string;
  @IsNotEmpty({ message: 'detailedAddress không được để trống' })
  detailedAddress: string;
  @IsNotEmpty({ message: 'fullAddress không được để trống' })
  fullAddress: string;
  @IsNotEmpty({ message: 'country không được để trống' })
  country: string;
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty({ message: 'type không được để trống' })
  type: string;

  @IsNotEmpty({ message: 'size không được để trống' })
  size: string;

  @IsNotEmpty({ message: 'industry không được để trống' })
  industry: string;

  @IsNotEmpty({ message: 'workingDays không được để trống' })
  @IsArray({ message: 'workingDays phải là mảng' })
  workingDays: string[];

  @IsNotEmpty({ message: 'overtimePolicy không được để trống' })
  overtimePolicy: string;
}
