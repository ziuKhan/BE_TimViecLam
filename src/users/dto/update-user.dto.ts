import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  _id: string;
}
//OmitType giúp loại bỏ 1 property trong class nếu không muốn update
