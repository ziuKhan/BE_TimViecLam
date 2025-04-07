import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsOptional()
  @IsString()
  password?: string;
}
// export class UpdateUserDto extends OmitType(CreateUserDto, [
//   'email',
// ] as const) {}
//OmitType giúp loại bỏ 1 property trong class nếu không muốn update
