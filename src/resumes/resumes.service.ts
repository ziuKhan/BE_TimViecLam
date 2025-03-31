import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import mongoose from 'mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import path from 'path';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}
  async create(createUserCVDto: CreateUserCVDto, user: IUser) {
    const resume = await this.resumeModel.create({
      ...createUserCVDto,
      userId: user._id,
      email: user.email,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: { _id: user._id, email: user.email },
        },
      ],
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: resume._id, createAt: resume.createdAt };
  }

  async findByUser(user: IUser) {
    return this.resumeModel
      .find({ userId: user._id })
      .sort('-createdAt')
      .populate([
        { path: 'userId', select: { name: 1 } },
        { path: 'jobId', select: { name: 1 } },
      ]);
  }

  async findAll(currentPage: number, limit: number, search: string, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } },
      ];
    }

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
    return this.resumeModel
      .findById(id)
      .populate({ path: 'companyId' })
      .populate({ path: 'jobId' });
  }

  update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found';

    return this.resumeModel.updateOne(
      { _id: id },
      {
        ...updateResumeDto,
        $push: {
          history: {
            status: updateResumeDto?.status || 'PENDING',
            updatedAt: new Date(),
            updatedBy: { _id: user._id, email: user.email },
          },
        },
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found';
    this.resumeModel.updateOne(
      { _id: id },
      { deletedByBy: { _id: user._id, email: user.email } },
    );
    return this.resumeModel.softDelete({ _id: id });
  }
}
