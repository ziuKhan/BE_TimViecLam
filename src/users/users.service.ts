import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>,
  ) {}

  // hash password
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDt: CreateUserDto, iuser: IUser) {
    if (
      await this.UserModel.findOne({
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
    let user = await this.UserModel.create({
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
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.UserModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.UserModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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

    return this.UserModel.findById(id);
  }

  findOneByUsername(username: string) {
    return this.UserModel.findOne({ email: username });
  }

  isValidPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, iuser: IUser) {
    updateUserDto.password = await this.hashPassword(updateUserDto.password);
    return await this.UserModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto, updatedBy: { _id: iuser._id, email: iuser.email } },
    );
  }

  async remove(id: string, iuser: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tồn tại ID';
    await this.UserModel.updateOne(
      { _id: id },
      { deletedBy: { _id: iuser?._id, email: iuser?.email } },
    );

    return await this.UserModel.softDelete({ _id: id });
  }

  async register(registerUserDto: RegisterUserDto) {
    if (
      await this.UserModel.findOne({
        email: registerUserDto.email,
      })
    ) {
      throw new BadRequestException(
        `Email ${registerUserDto.email} đã tồn tại, vui lòng điền email khác`,
      );
    }

    registerUserDto.password = await this.hashPassword(
      registerUserDto.password,
    );
    //create a new user
    let user = await this.UserModel.create({
      ...registerUserDto,
      role: 'USER',
    });

    return {
      _id: user?._id,
      createdAt: user?.createdAt,
    };
  }

  updateUserToken = (refreshToken: string, _id: string) => {
    return this.UserModel.updateOne({ _id }, { refreshToken });
  };

  findUserByToken = (refreshToken: string) => {
    return this.UserModel.findOne({ refreshToken });
  };
  
}
