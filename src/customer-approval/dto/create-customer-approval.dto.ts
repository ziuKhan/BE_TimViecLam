import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsBoolean } from 'class-validator';

export class CreateCustomerApprovalDto {
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @IsString({ message: 'Họ phải là chữ' })
  lastName: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Ghi chú phải là chữ' })
  firstName: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mã số thuế không được để trống' })
  taxCode: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Logo không được để trống' })
  logo: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString({ message: 'Địa chỉ phải là chữ' })
  address: string;

  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  @IsString({ message: 'Tên công ty phải là chữ' })
  companyName: string;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chữ' })
  status: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chữ' })
  description: string;

  @IsNotEmpty({ message: 'Điều khoản không được để trống' })
  @IsBoolean({ message: 'Điều khoản phải là boolean' })
  clause: boolean;

  @IsOptional()
  @IsString({ message: 'Lý do phải là chữ' })
  reason: string;
}

