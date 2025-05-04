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
      '5453fa9d-c19c-42e9-9278-78da7ab4cb22',
      '0b0dd15c-8005-4dd7-904c-28c35f272eff',
      '542871151a5b87b3f4b16814f8e66c1214a6a235845325b3b7169288b24463a2',
    );
  }

  async getMaxOrderCode(): Promise<number> {
    const maxOrder = await this.transactionModel
      .findOne()
      .sort({ orderCode: -1 }) // Sắp xếp theo orderCode giảm dần
      .select('orderCode') // Chỉ lấy trường orderCode
      .exec();
    return maxOrder?.orderCode || 124;
  }
  
  async create(createTransactionDto: CreateTransactionDto, user: IUser) { 
    try {
      let orderCode = (await this.getMaxOrderCode()) + 1;

      // Nếu là giao dịch nâng cấp VIP
      if (createTransactionDto.type === 'VIP_UPGRADE') {
        const subscriptionPackage = await this.subscriptionPackageService.findOne(createTransactionDto.packageId);
        if (!subscriptionPackage) {
          throw new BadRequestException('Gói đăng ký không tồn tại');
        }
        createTransactionDto.amount = subscriptionPackage.price;
        createTransactionDto.description = `Nâng cấp tài khoản ${subscriptionPackage.name}`;
      }

      await this.transactionModel.create({
        ...createTransactionDto,
        orderCode,
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
