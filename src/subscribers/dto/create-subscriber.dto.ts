import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Không được để trống email' })
  @IsEmail({ message: 'Không đúng định dạng email' })
  email: string;

  @IsNotEmpty({ message: 'Không được để trống name' })
  name: string;

  @IsNotEmpty({ message: 'Không được để trống skills' })
  @IsString({ message: 'Vui lòng điền string' })
  @IsArray({ message: 'Skills có định dạng array' })
  skills: string[];
}
