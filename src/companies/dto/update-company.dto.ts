import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

// export class UpdateCompanyDto extends OmitType(CreateCompanyDto, [
//   'name',
// ] as const) {}
//OmitType giúp loại bỏ 1 property trong class nếu không muốn update
