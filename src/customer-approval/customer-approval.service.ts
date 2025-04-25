import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { CreateCustomerApprovalDto } from './dto/create-customer-approval.dto';
import { UpdateAcountSetupDto, UpdateCustomerApprovalDto } from './dto/update-customer-approval.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  CustomerApproval,
  CustomerApprovalDocument,
} from './schemas/customer-approval.schema';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';
import { User } from '../decorator/customize';
import { UserDocument } from '../users/schemas/user.schema';
import { HR_ROLE } from '../databases/sample';
import { Role, RoleDocument } from '../roles/Schemas/role.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CompaniesService } from '../companies/companies.service';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import * as bcryptJS from 'bcryptjs';

@Injectable()
export class CustomerApprovalService {
  constructor(
    @InjectModel(CustomerApproval.name)
    private customerApprovalModel: SoftDeleteModel<CustomerApprovalDocument>,
    private userService: UsersService,
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private companyService: CompaniesService,
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
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

    const customerApproval = await this.customerApprovalModel.findById(id);
    const fullName = customerApproval?.firstName + ' ' + customerApproval?.lastName;
    const homeUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const loginUrl = `${homeUrl}/login`;

    if(status === 'CN') {
      const resUser = await this.userService.findOneByEmail(updateCustomerApprovalDto.email);
      let password = Math.floor(100000 + Math.random() * 900000).toString();
      
      if(resUser) {
        const userRole = await this.roleModel.findOne({ name: HR_ROLE });
        await this.userService.update(resUser._id.toString(), {...resUser, role: userRole?._id.toString()}, user);
      } else {
        const resCompany: any = await this.companyService.createHR({
          name: updateCustomerApprovalDto.companyName,
          description: updateCustomerApprovalDto.description,
          logo: updateCustomerApprovalDto.logo,
        }, user);
        await this.userService.registerHR({
          email: updateCustomerApprovalDto.email,
          password,
          name: fullName,
          company: { _id: resCompany._id, name: resCompany.name },
          phoneNumber: updateCustomerApprovalDto.phoneNumber,
        });
      }
      
      // Gửi email thông báo chấp nhận
      await this.mailerService.sendMail({
        to: updateCustomerApprovalDto.email,
        from: '"ITViec" <itviec@example.com>',
        subject: 'IT Viec - Đăng ký của bạn đã được chấp nhận',
        template: 'approval-accepted',
        context: {
          name: fullName,
          email: updateCustomerApprovalDto.email,
          password,
          loginUrl,
        },
      });
    } else if (status === 'TC') {
      // Gửi email thông báo từ chối
      await this.mailerService.sendMail({
        to: updateCustomerApprovalDto.email,
        from: '"ITViec" <itviec@example.com>',
        subject: 'IT Viec - Đăng ký của bạn đã bị từ chối',
        template: 'approval-rejected',
        context: {
          name: fullName,
          reason: updateCustomerApprovalDto.reason || 'Không có lý do cụ thể được cung cấp.',
          homeUrl,
        },
      });
    }
    
    return res;
  }

  hashPassword(password: string) {
    return bcryptJS.hashSync(password, 10);
  }
  
  async UpdateAccountSetup(updateAcountSetupDto: UpdateAcountSetupDto, user: IUser) {
    const { company, ...userDto } = updateAcountSetupDto;

    const res: any = await this.companyModel.updateOne({_id: company._id}, {
      ...company,
      createdBy: { _id: user._id, email: user.email },
    });

    const resUser = await this.userService.update(userDto._id, {
      ...userDto,
      isSetup: true,
    }, user);

    return {
      company: res,
      user: resUser,
    };
  }

}
