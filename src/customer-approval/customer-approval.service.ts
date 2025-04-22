import { Injectable } from '@nestjs/common';
import { CreateCustomerApprovalDto } from './dto/create-customer-approval.dto';
import { UpdateCustomerApprovalDto } from './dto/update-customer-approval.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  CustomerApproval,
  CustomerApprovalDocument,
} from './schemas/customer-approval.schema';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class CustomerApprovalService {
  constructor(
    @InjectModel(CustomerApproval.name)
    private customerApprovalModel: SoftDeleteModel<CustomerApprovalDocument>,
  ) {}
  create(createCustomerApprovalDto: CreateCustomerApprovalDto) {
    return this.customerApprovalModel.create(createCustomerApprovalDto);
  }

  async findAll(
    currentPage: number,
    limit: number,
    search: string,
    qs: string,
  ) {
    const { filter, sort, population } = aqp(qs);

    if (search) {
      filter.$or = [{ name: { $regex: new RegExp(search), $options: 'i' } }];
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.customerApprovalModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const customerApprovalU = await this.customerApprovalModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .lean()
      .exec();

    const result = await Promise.all(customerApprovalU);

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

  async findOne(id: string) {
    return this.customerApprovalModel.findOne({ _id: id });
  }

  update(
    id: string,
    updateCustomerApprovalDto: UpdateCustomerApprovalDto,
    user: IUser,
  ) {
    return this.customerApprovalModel.updateOne(
      { _id: id },
      {
        ...updateCustomerApprovalDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.customerApprovalModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.customerApprovalModel.softDelete({ _id: id });
  }

  async updateStatus(id: string, status: string, updateCustomerApprovalDto: UpdateCustomerApprovalDto, user: IUser) {
    const res = await this.customerApprovalModel.updateOne(
      { _id: id },
      { status: status, reason: updateCustomerApprovalDto.reason, updatedBy: { _id: user._id, email: user.email } },
    );

    if(status === 'CN') {

    }
    return res;
  }
}
