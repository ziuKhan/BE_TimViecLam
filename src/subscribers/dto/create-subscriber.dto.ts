import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Không được để trống email' })
  @IsEmail({}, { message: 'Không đúng định dạng email' })
  email: string;

  @IsNotEmpty({ message: 'Không được để trống name' })
  @IsString({ message: 'Name phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Không được để trống skills' })
  @IsArray({ message: 'Skills phải là một mảng' })
  @ArrayNotEmpty({ message: 'Skills không được để trống' })
  @IsString({ each: true, message: 'Mỗi kỹ năng trong skills phải là chuỗi' })
  skills: string[];
}
