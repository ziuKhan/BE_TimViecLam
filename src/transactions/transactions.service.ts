import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import PayOS from '@payos/node';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CommonQueryDto } from '../dto/common-query.dto';
import aqp from 'api-query-params';
import { IUser } from '../auth/users.interface';
import { VipHistoryService } from '../vip-history/vip-history.service';
import { SubscriptionPackageService } from '../subscription-package/subscription-package.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  private payos: PayOS;
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: SoftDeleteModel<TransactionDocument>,
    private vipHistoryService: VipHistoryService,
    private subscriptionPackageService: SubscriptionPackageService,
    private usersService: UsersService
  ) {
    this.payos = new PayOS(
      '9ee20970-bc51-4380-88b7-0f5253cfbd78',
      'a6a720f7-fb58-4de5-9946-883b171f6fc9',
      '695538773d8fdda48612939fd5d4ea524c289a4ae3e3aaab68c8860d16697d1a',
    );
  }

  async create(createTransactionDto: CreateTransactionDto, user: IUser) { 
    try {
      const orderCode = Date.now();

      // Nếu là giao dịch nâng cấp VIP
      if (createTransactionDto.type === 'VIP_UPGRADE') {
        const subscriptionPackage = await this.subscriptionPackageService.findOne(createTransactionDto.packageId);
        if (!subscriptionPackage) {
          throw new BadRequestException('Gói đăng ký không tồn tại');
        }
      }

      await this.transactionModel.create({
        ...createTransactionDto,
        orderCode,
        user: user._id,
        amountAfterTax: createTransactionDto.amount * 0.9,
        tax: createTransactionDto.amount * 0.1,
        taxPercentage: 10,
        createdBy: {
          _id: user._id,
          email: user.email
        }
      });

      const paymentLink = await this.payos.createPaymentLink({
        ...createTransactionDto,
        orderCode
      });

      return paymentLink;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string | number) {
    const getPayment = await this.payos.getPaymentLinkInformation(id);
    return getPayment;
  }

  async remove(id: number) {
    const transaction = await this.transactionModel.findOne({ orderCode: id });
    if (!transaction) {
      throw new BadRequestException('Giao dịch không tồn tại');
    }
     await this.transactionModel.deleteOne({ orderCode: id });
    const deletePayment = await this.payos.cancelPaymentLink(id);
    return deletePayment;
  }

  async findAll(currentPage: number, limit: number, search: string, qs: string) {
    const { filter, sort, projection } = aqp(qs);

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
      filter.$or = [
        { buyerName: { $regex: search, $options: 'i' } },
        { buyerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const totalItems = await this.transactionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const items = await this.transactionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate([
        {
          path: 'user',
          select: 'name email'
        },
        {
          path: 'packageId',
          select: 'name code price duration'
        }
      ])
      .exec();

    return {
      current: currentPage, //trang hiện tại
      pageSize: limit, //số lượng bản ghi đã lấy
      pages: totalPages, //tổng số trang với điều kiện query
      total: totalItems, // tổng số phần tử (số bản ghi)
      items,
    };
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async handleWebhook(webhookData: any) {
    console.log('data', webhookData);

    const data = webhookData.data;
    if(data.orderCode == 123) return { message: 'Webhook received successfully' }; 

    const transaction = await this.transactionModel.findOne({ orderCode: data.orderCode });
    if (!transaction) {
      throw new BadRequestException('Giao dịch không tồn tại');
    }

    // Cập nhật thông tin giao dịch
    await this.transactionModel.updateOne(
      { orderCode: data.orderCode },
      {
        currency: data.currency,
        accountName: data.counterAccountName,
        accountNumber: data.counterAccountNumber,
        status: 'PAID',
        counterAccountBankId: data.counterAccountBankId,
        counterAccountName: data.counterAccountName,
        counterAccountNumber: data.counterAccountNumber,
        transactionDateTime: data.transactionDateTime,
      }
    );

    // Nếu là giao dịch nâng cấp VIP
    if (transaction.type === 'VIP_UPGRADE' && transaction.packageId) {
      const subscriptionPackage = await this.subscriptionPackageService.findOne(transaction.packageId.toString());
      
      // Tạo VIP history
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + subscriptionPackage.duration);

      await this.vipHistoryService.create({
        userId: transaction.user.toString(),
        packageId: transaction.packageId.toString(),
        startDate,
        endDate,
        status: 'ACTIVE',
        transactionId: transaction._id.toString()
      }, { _id: transaction.user.toString(), email: transaction.buyerEmail });

      // Cập nhật trạng thái VIP của user
      await this.usersService.upgradeToVIP(
        transaction.user.toString(),
        subscriptionPackage.duration
      );
    }
    
    return { message: 'Webhook received successfully' };
  }
}
