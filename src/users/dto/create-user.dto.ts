import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ a@a.a' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  name: string;
  phone: number;
  address: string;
}
