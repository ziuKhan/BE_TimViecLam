import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  // hash password
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDt: CreateUserDto) {
    //call hash password
    createUserDt.password = await this.hashPassword(createUserDt.password);

    //create a new user
    let user = await this.UserModel.create(createUserDt);
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found';

    return this.UserModel.findById(id);
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.UserModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Không tồn tại ID';

    return this.UserModel.deleteOne({ _id: id });
  }
}
