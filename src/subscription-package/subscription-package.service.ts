import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionPackage, SubscriptionPackageDocument } from './schemas/subscription-package.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';

@Injectable()
export class SubscriptionPackageService {
  constructor(
    @InjectModel(SubscriptionPackage.name)
    private subscriptionPackageModel: SoftDeleteModel<SubscriptionPackageDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: SoftDeleteModel<TransactionDocument>
  ) {}

  async create(createSubscriptionPackageDto: CreateSubscriptionPackageDto, user: IUser) {
    const { name, code } = createSubscriptionPackageDto;

    const existingPackage = await this.subscriptionPackageModel.findOne({
      $or: [{ name }, { code }]
    });

    if (existingPackage) {
      throw new BadRequestException('Gói đăng ký với tên hoặc mã này đã tồn tại');
    }

    const newPackage = await this.subscriptionPackageModel.create({
      ...createSubscriptionPackageDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return newPackage;
  }

  async findAll(currentPage: number, limit: number, search: string, qs: string): Promise<{
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: any[];
  }> {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    const totalItems = (await this.subscriptionPackageModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const subscriptionPackages = await this.subscriptionPackageModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    // Sử dụng Promise.all để đợi tất cả các promise hoàn thành
    const result = await Promise.all(
      subscriptionPackages.map(async (item) => {
        const transactions = await this.transactionModel.find({
          packageId: item._id
        });
        // Chuyển đổi mongoose document thành plain object
        const plainItem = item.toObject();
        return {
          ...plainItem,
          transactions: transactions,
          totalTransactions: transactions.length || 0
        };
      })
    );

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    };
  }

  async findOne(id: string) {
    return await this.subscriptionPackageModel.findById(id);
  }

  async update(id: string, updateSubscriptionPackageDto: UpdateSubscriptionPackageDto, user: IUser) {
    return await this.subscriptionPackageModel.findByIdAndUpdate(id, {
      ...updateSubscriptionPackageDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    }, { new: true });
  }

  async remove(id: string, user: IUser) {
    await this.subscriptionPackageModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.subscriptionPackageModel.softDelete({
      _id: id
    });
  }
}
