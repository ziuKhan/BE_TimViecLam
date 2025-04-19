import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './Schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { Company, CompanyDocument } from 'src/companies/schemas/company.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Company.name)
    private CompanyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    const createJob = await this.JobModel.create({
      ...createJobDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: createJob._id, createdAt: createJob.createdAt };
  }

  async findAll(currentPage: number, limit: number, search: string, qs: string) {
    const { filter, sort, population } = aqp(qs);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.JobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (search) {
      const companies = await this.CompanyModel.find({
        name: { $regex: new RegExp(search), $options: 'i' },
      });
      const companyIds = companies.map(company => company._id);

      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } },
        { companyId: { $in: companyIds } },
      ];
    }

    const result = await this.JobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .populate('companyId')
      .populate('skills')
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Không tìm thấy công việc');
    }
    return this.JobModel.findById(id).populate({
      path: 'companyId',
      select: { name: 1, _id: 1, logo: 1 },
    });
  }

  update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    return this.JobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.JobModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.JobModel.softDelete({ _id: id });
  }

  async updateCountResume(id: string) {
    await this.JobModel.updateOne(
      { _id: id },
      { $inc: { countResume: 1 } },
      { new: true },
    );
  }
}
