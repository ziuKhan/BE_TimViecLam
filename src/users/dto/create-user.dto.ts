import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsOptional() 
  _id!: mongoose.Schema.Types.ObjectId;
  
  @IsOptional() 
  name!: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ a@a.a' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsString({ message: 'address phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'address không được để trống' })
  address: string;

  @IsOptional()
  @IsString({ message: 'gender phải là chuỗi ký tự' })
  gender: string;

  @IsBoolean()
  isActive: boolean;

  @IsMongoId({ each: true, message: 'permissions là 1 objectID trong mongo' })
  @IsNotEmpty({ message: 'role không được để trống' })
  role: string;

  @IsOptional()
  @Type(() => Company)
  company!: Company;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  isSetup: boolean;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ a@a.a' })
  email: string;

  @IsOptional()
  @IsString()
  avatar: string;
  
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;
}

export class RegisterHRUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ a@a.a' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'phoneNumber không được để trống' })
  phoneNumber: string;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company?: Company;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'khang', description: 'username' })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}
