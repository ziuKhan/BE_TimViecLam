import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Vui lòng điền name' })
  name: string;
  @IsNotEmpty({ message: 'Vui lòng điền apiPath' })
  apiPath: string;
  @IsNotEmpty({ message: 'Vui lòng điền method' })
  method: string;
  @IsNotEmpty({ message: 'Vui lòng điền module' })
  module: string;
}
