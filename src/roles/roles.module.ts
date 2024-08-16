import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import mongoose from 'mongoose';
import { Role, RoleSchema } from './Schemas/role.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
