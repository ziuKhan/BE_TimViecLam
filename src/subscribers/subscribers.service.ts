import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from './Schemas/subscriber.schema';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private SubscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}

  async createOrUpdate(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    if (
      await this.SubscriberModel.findOne({ email: createSubscriberDto.email })
    ) {
      return await this.update(createSubscriberDto, user);
    } else {
      return await this.create(createSubscriberDto, user);
    }
  }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    if (
      await this.SubscriberModel.findOne({ email: createSubscriberDto.email })
    ) {
      throw new BadRequestException(
        `Email ${createSubscriberDto.email} đã được đăng ký`,
      );
    }

    const subscriber = await this.SubscriberModel.create({
      ...createSubscriberDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: subscriber._id, createdAt: subscriber.createdAt };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.SubscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.SubscriberModel.find(filter)
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Id tồn tại');

    return this.SubscriberModel.findById(id);
  }

  findOneByEmail(email: string) {
    return this.SubscriberModel.findOne({ email: email });
  }

  update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return this.SubscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: { _id: user._id, email: user.email },
      },
      { upsert: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Id tồn tại');

    await this.SubscriberModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.SubscriberModel.softDelete({ _id: id });
  }

  async getSkills(user: IUser) {
    const { email } = user;
    return await this.SubscriberModel.findOne({ email }, { skills: 1 });
  }
}
