import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
// export class UpdateUserDto extends OmitType(CreateUserDto, [
//   'email',
// ] as const) {}
//OmitType giúp loại bỏ 1 property trong class nếu không muốn update
