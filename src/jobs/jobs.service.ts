import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './Schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
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

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } },
      ];
    }
    
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.JobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.JobModel.find(filter)
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
}
