import { Injectable, Query } from '@nestjs/common';
import { CreateCompanyDto, CreateCompanyHRDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/auth/users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import { Job, JobDocument } from '../jobs/Schemas/job.schema';
import { count } from 'console';
import { IPaginationResponse } from '../interfaces/pagination.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    private usersService: UsersService,
  ) {}

  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: { _id: user._id, email: user.email },
    });
  }

  createHR(createCompanyDto: CreateCompanyHRDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: { _id: user._id, email: user.email },
      isActive: false,
    });
  }

  async findJobs(id: string) {
    return await this.jobModel.countDocuments({ companyId: id }).exec();
  }

  async findAll(
    currentPage: number,
    limit: number,
    search: string,
    qs: string,
  ): Promise<IPaginationResponse<Company>> {
    const { filter, sort, population } = aqp(qs);

    if (search) {
      filter.$or = [{ name: { $regex: new RegExp(search), $options: 'i' } }];
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const companyU = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .lean()
      .exec();

    const result = await Promise.all(
      companyU.map(async (item) => {
        return {
          ...item,
          jobs: await this.findJobs(item._id.toString()),
        };
      }),
    );

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
    return this.companyModel.findOne({ _id: id });
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.companyModel.softDelete({ _id: id });
  }
}
