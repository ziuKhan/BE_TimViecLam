import { Injectable } from '@nestjs/common';
import { CreateVipHistoryDto } from './dto/create-vip-history.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VipHistory, VipHistoryDocument } from './schemas/vip-history.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class VipHistoryService {
  constructor(
    @InjectModel(VipHistory.name)
    private vipHistoryModel: SoftDeleteModel<VipHistoryDocument>
  ) {}

  async create(createVipHistoryDto: CreateVipHistoryDto, user: IUser) {
    const newHistory = await this.vipHistoryModel.create({
      ...createVipHistoryDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return newHistory;
  }

  async findAll(currentPage: number, limit: number,search: string, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { packageId: { $regex: search, $options: 'i' } }
      ];
    }
    const totalItems = (await this.vipHistoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.vipHistoryModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate([
        {
          path: 'userId',
          select: 'name email'
        },
        {
          path: 'packageId',
          select: 'name code price duration'
        },
        {
          path: 'transactionId',
          select: 'orderCode amount status'
        }
      ])
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async findByUser(userId: string) {
    return await this.vipHistoryModel
      .find({ userId })
      .populate([
        {
          path: 'packageId',
          select: 'name code price duration'
        },
        {
          path: 'transactionId',
          select: 'orderCode amount status'
        }
      ])
      .sort({ createdAt: -1 });
  }

  async getCurrentVip(userId: string) {
    return await this.vipHistoryModel
      .findOne({ 
        userId,
        status: 'ACTIVE',
        endDate: { $gt: new Date() }
      })
      .populate([
        {
          path: 'packageId',
          select: 'name code price duration features'
        }
      ]);
  }

  async updateStatus(id: string, status: string, user: IUser) {
    return await this.vipHistoryModel.findByIdAndUpdate(
      id,
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { new: true }
    );
  }

  // Cron job sẽ gọi hàm này để kiểm tra và cập nhật trạng thái
  async checkAndUpdateExpiredVip() {
    const currentDate = new Date();
    const expiredHistories = await this.vipHistoryModel.find({
      status: 'ACTIVE',
      endDate: { $lt: currentDate }
    });

    for (const history of expiredHistories) {
      await this.vipHistoryModel.updateOne(
        { _id: history._id },
        { status: 'EXPIRED' }
      );
    }
  }
}
