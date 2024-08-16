import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/Schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/Schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Permission.name)
    private permissionsModel: SoftDeleteModel<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) {}
  async onModuleInit() {
    if (Boolean(this.configService.get<string>('SHOULD_INIT'))) {
      const countUser = await this.userModel.count({});
      const countRole = await this.roleModel.count({});
      const countPermission = await this.permissionsModel.count({});

      if (countPermission === 0) {
        await this.permissionsModel.insertMany(INIT_PERMISSIONS);
      }
      if (countRole === 0) {
        const permission = await this.permissionsModel.find({}).select('_id');

        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Admin thì full quyền :v',
            isActive: true,
            permissions: permission,
          },
          {
            name: USER_ROLE,
            description: 'Người dùng và ứng viên hệ thống :v',
            isActive: true,
            permissions: [],
          },
        ]);
      }

      if (countUser === 0) {
        const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });
        await this.userModel.insertMany([
          {
            email: 'admin@gmail.com',
            password: await this.userService.hashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            name: 'admin',
            address: 'Hưng Yên',
            gender: 'Nam',
            age: 1,
            role: adminRole?._id,
          },
          {
            email: 'khang@gmail.com',
            password: await this.userService.hashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            name: 'khang',
            address: 'Hưng Yên',
            gender: 'Nam',
            age: 22,
            role: adminRole?._id,
          },
          {
            email: 'user@gmail.com',
            password: await this.userService.hashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            name: 'user',
            address: 'Hà Nội',
            gender: 'Nam',
            age: 1,
            role: userRole?._id,
          },
        ]);
      }

      if (countUser === 0 && countRole === 0 && countPermission === 0) {
        this.logger.log('Init databases successfully');
      }
    }
  }
}
