import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import mongoose from 'mongoose';
import { IUser } from 'src/auth/users.interface';
import aqp from 'api-query-params';
import path from 'path';
import { JobsService } from '../jobs/jobs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    private jobService: JobsService,
    private notificationService: NotificationsService,
    private mailerService: MailerService,
  ) {}
  async create(createUserCVDto: CreateUserCVDto, user: IUser | any) {
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
    await this.jobService.updateCountResume(resume.jobId.toString());
    const job = await this.jobService.findOne(resume.jobId.toString());
    await this.notificationService.create(
      {
        title: 'Tạo hồ sơ mới thành công',
        message: 'Bạn đã gửi hồ sơ ứng tuyển cho công việc: ' + job.name,
        isGlobal: false,
        type: 'SUCCESS',
        userIds: [user._id],
        objInfo: {
          _id: resume.jobId.toString(),
          name: 'CREATE',
          type: 'RESUME',
        },
        isURL: false,
        url: '',
      },
      user,
    );
    return { _id: resume._id, createAt: resume.createdAt };
  }

  async findByUser(user: IUser) {
    return this.resumeModel
      .find({ userId: user._id })
      .sort('-createdAt')
      .populate([
        { path: 'userId', select: { name: 1 } },
        { path: 'jobId', select: { name: 1 } },
        { path: 'companyId', select: { name: 1 } },
      ]);
  }

  async findAll(
    currentPage: number,
    limit: number,
    search: string,
    qs: string,
  ) {
    const { filter, sort, population, projection } = aqp(qs);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
      filter.$or = [{ name: { $regex: new RegExp(search), $options: 'i' } }];
    }

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .populate('jobId')
      .populate('companyId')
      .populate('userId')
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
      .populate({
        path: 'jobId',
        populate: {
          path: 'skills',
          select: 'name',
        },
      });
  }

  async update(
    id: string,
    updateResumeDto: UpdateResumeDto,
    user: IUser | any,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found';
    const resume = await this.resumeModel
      .findById(id)
      .populate({ path: 'companyId' })
      .populate({ path: 'userId' })
      .populate({
        path: 'jobId',
        populate: {
          path: 'skills',
          select: 'name',
        },
      });
    if (!resume) {
      throw new BadRequestException('Hồ sơ không tồn tại');
    }
    const res = await this.resumeModel.updateOne(
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
    const renderStatus = (status: string) => {
      switch (status) {
        case 'PENDING':
          return 'ĐANG CHỜ';
        case 'REVIEWING':
          return 'ĐANG XEM XÉT';
        case 'APPROVED':
          return 'ĐÃ DUYỆT';
        case 'REJECTED':
          return 'ĐÃ TỪ CHỐI';
      }
    };
    const job = await this.jobService.findOne(updateResumeDto.jobId.toString());

    await this.notificationService.create(
      {
        title: 'Thông báo trạng thái hồ sơ',
        message: `Trạng thái hồ sơ ứng tuyển dự án ${
          job.name
        } được cập nhật thành: ${renderStatus(updateResumeDto.status)}`,
        isGlobal: false,
        type: 'SUCCESS',
        userIds: [updateResumeDto.userId],
        objInfo: {
          _id: id,
          name: 'UPDATE',
          type: 'RESUME',
        },
        isURL: false,
        url: '',
      },
      user,
    );
    if (updateResumeDto.status === 'REJECTED') {
      await this.mailerService.sendMail({
        to: resume.email,
        from: '"ITViec" <itviec@example.com>',
        subject: 'IT Viec - Thông báo về hồ sơ ứng tuyển',
        template: 'resume-rejected',
        context: {
          reason: updateResumeDto.reason,
          userName:
            resume.userId && 'name' in resume.userId
              ? resume.userId.name
              : 'Ứng viên',
          jobName:
            resume.jobId && 'name' in resume.jobId
              ? resume.jobId.name
              : 'Vị trí ứng tuyển',
          companyName:
            resume.companyId && 'name' in resume.companyId
              ? resume.companyId.name
              : 'Công ty',
          email: resume.email,
        },
      });
    } else if (updateResumeDto.status === 'APPROVED') {
      await this.mailerService.sendMail({
        to: resume.email,
        from: '"ITViec" <itviec@example.com>',
        subject: 'IT Viec - Chúc mừng! Hồ sơ của bạn đã được phê duyệt',
        template: 'resume-approved',
        context: {
          reason: updateResumeDto.reason,
          userName:
            resume.userId && 'name' in resume.userId
              ? resume.userId.name
              : 'Ứng viên',
          jobName:
            resume.jobId && 'name' in resume.jobId
              ? resume.jobId.name
              : 'Vị trí ứng tuyển',
          companyName:
            resume.companyId && 'name' in resume.companyId
              ? resume.companyId.name
              : 'Công ty',
          email: resume.email,
        },
      });
    }

    return res;
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
