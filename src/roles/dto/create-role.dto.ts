import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Vui lòng điền name' })
  name: string;
  @IsNotEmpty({ message: 'Vui lòng điền description' })
  description: string;
  @IsNotEmpty({ message: 'Vui lòng điền isActive' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Vui lòng điền permissions' })
  @IsArray({ message: 'permissions phải là 1 array' })
  @IsMongoId({ each: true, message: 'permissions là 1 objectID trong mongo' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
