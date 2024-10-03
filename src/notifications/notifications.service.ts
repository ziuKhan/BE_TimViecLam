import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { IUser } from '../auth/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationDocument ,Notification} from './Schemas/notification.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { unregisterDecorator } from 'handlebars/runtime';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private NotificationModel: SoftDeleteModel<NotificationDocument>,
  ) {}


  async create(createNotificationDto: CreateNotificationDto, user: IUser) {
    const createJob = await this.NotificationModel.create({
      ...createNotificationDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: createJob._id, createdAt: createJob.createdAt, type: createJob.type };
  }

  async findAll(
    gte: number,
    lte: number,
    currentPage: number,
    limit: number,
    qs: string,
  ) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.gte;
    delete filter.lte;
    delete filter.pageSize;

    // Chỉ xử lý nếu filter.salary là một đối tượng
    if (gte && lte) {
      filter.salary = { $gte: gte, $lte: lte };
    } else if (gte) {
      filter.salary = { $gte: gte };
    } else if (lte) {
      filter.salary = { $lte: lte };
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.NotificationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.NotificationModel.find(filter)
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
    return this.NotificationModel.findById(id);
  }

  update(id: string, updateNotificationDto: UpdateNotificationDto, user: IUser) {
    return this.NotificationModel.updateOne(
      { _id: id },
      {
        ...updateNotificationDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.NotificationModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.NotificationModel.softDelete({ _id: id });
  }
}
