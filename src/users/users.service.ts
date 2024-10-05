import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  RegisterHRUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcryptJS from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import { Permission } from 'src/permissions/Schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/Schemas/role.schema';
import { HR_ROLE, USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  // hash password
  hashPassword(password: string) {
    return bcryptJS.hashSync(password, 10);
  }

  async create(createUserDt: CreateUserDto, iuser: IUser) {
    if (
      await this.userModel.findOne({
        email: createUserDt.email,
      })
    ) {
      throw new BadRequestException(
        `Email ${createUserDt.email} đã tồn tại, vui lòng điền email khác`,
      );
    }
    //call hash password
    createUserDt.password = await this.hashPassword(createUserDt.password);

    //create a new user
    let user = await this.userModel.create({
      ...createUserDt,
      createdBy: { _id: iuser?._id, email: iuser?.email },
    });
    return {
      _id: user?._id,
      createdAt: user?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result,
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found';

    return this.userModel
      .findById(id)
      .select('-password')
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate({
      path: 'role',
      select: { name: 1, _id: 1 },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, iUser: IUser) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    return this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: { _id: iUser._id, email: iUser.email },
      },
    );
  }

  async remove(id: string, iUser: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Không tồn tại ID');

    if (
      (await this.userModel.findById({ _id: id }))?.email === 'admin@gmail.com'
    )
      throw new BadRequestException('ADMIN không đọc xóa');

    await this.userModel.updateOne(
      { _id: id },
      { deletedBy: { _id: iUser?._id, email: iUser?.email } },
    );

    return await this.userModel.softDelete({ _id: id });
  }

  async register(registerUserDto: RegisterUserDto) {
    if (
      await this.userModel.findOne({
        email: registerUserDto.email,
      })
    ) {
      throw new BadRequestException(
        `Email ${registerUserDto.email} đã tồn tại, vui lòng điền email khác`,
      );
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    registerUserDto.password = await this.hashPassword(
      registerUserDto.password,
    );

    //create a new user
    let user = await this.userModel.create({
      ...registerUserDto,
      role: userRole?._id,
      avatar: 'avatar_user.svg',
    });

    return {
      _id: user?._id,
      createdAt: user?.createdAt,
    };
  }
  async registerGoogleUser(googleUser: {
    name: string;
    email: string;
    googleId: string;
  }) {
    // Kiểm tra xem người dùng đã tồn tại với email này chưa
    let user = await this.userModel.findOne({ email: googleUser.email });
    if (user) {
      throw new BadRequestException(
        `Email ${googleUser.email} đã tồn tại, vui lòng sử dụng một email khác.`,
      );
    }

    // Tìm vai trò mặc định của người dùng
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    // Tạo người dùng mới
    user = new this.userModel({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      avatar: 'avatar_user.svg',
      role: userRole?._id,
      isActive: true,
    });

    await user.save();

    return user;
  }

  async registerHR(registerHRUserDto: RegisterHRUserDto) {
    if (
      await this.userModel.findOne({
        email: registerHRUserDto.email,
      })
    ) {
      throw new BadRequestException(
        `Email ${registerHRUserDto.email} đã tồn tại, vui lòng điền email khác`,
      );
    }

    const userRole = await this.roleModel.findOne({ name: HR_ROLE });

    registerHRUserDto.password = await this.hashPassword(
      registerHRUserDto.password,
    );
    //create a new user
    let user = await this.userModel.create({
      ...registerHRUserDto,
      role: userRole?._id,
      avatar: 'avatar_user.svg',
      isActive: false,
    });

    return {
      _id: user?._id,
      createdAt: user?.createdAt,
    };
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username }).populate({
      path: 'role',
      select: { name: 1 },
    });
  }

  async changePassword(
    objectPass: { password: string; newPassword: string },
    iUser: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(iUser._id)) return 'Not found';
    const user: any = await this.userModel.findOne({ _id: iUser._id });

    if (await this.isValidPassword(objectPass.password, user.password)) {
      return this.userModel.updateOne(
        { _id: user._id },
        { password: this.hashPassword(objectPass.newPassword) },
      );
    } else {
      throw new BadRequestException('Password không trùng');
    }
  }

  async isValidPassword(password: string, hash: string): Promise<boolean> {
    return bcryptJS.compare(password, hash);
  }

  updateUserToken = (refreshToken: string, _id: string) => {
    return this.userModel.updateOne({ _id }, { refreshToken });
  };

  findUserByToken = (refreshToken: string) => {
    return this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: { name: 1 },
    });
  };
}
