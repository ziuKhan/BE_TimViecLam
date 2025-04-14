import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { IUser } from '../auth/users.interface';
import { Notification, NotificationDocument } from './Schemas/notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificationUser, NotificationUserDocument } from './schemas/notificationUser.schema';
@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: SoftDeleteModel<NotificationDocument>,
    @InjectModel(NotificationUser.name)
    private notificationUserModel: Model<NotificationUserDocument>,
    private websocketGateway: WebsocketsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, user: IUser) {

    const notification = await this.notificationModel.create({...createNotificationDto, createdBy: { _id: user._id, email: user.email }});

    if (createNotificationDto.isGlobal) {
      // Gửi tới tất cả user
      this.websocketGateway.sendNotificationToAllUsers(createNotificationDto.title, 'notification');
    } else if (createNotificationDto.userIds?.length) {
      const notificationUsers = createNotificationDto.userIds.map((userId) => ({
        notificationId: notification._id,
        userId: userId.toString(),
      }));
  
      await this.notificationUserModel.insertMany(notificationUsers);
  
      // gửi thông báo qua socket cá nhân từng người
      createNotificationDto.userIds.forEach((userId) => {
        this.websocketGateway.sendNotificationToUser({
          userId: userId.toString(),
          message: createNotificationDto.title,
          event: 'notification',
        });
      });
    }
    return notification;

  }

  async createBySystem(createNotificationDto: CreateNotificationDto) {
    const { userIds, ...notificationData } = createNotificationDto;

    const notification = await this.notificationModel.create({...notificationData, createdBy: { _id: '67d5494a69a6beb78a4d6f01', email: 'admin@gmail.com' }});

    if (createNotificationDto.isGlobal) {
      // Gửi tới tất cả user
      this.websocketGateway.sendNotificationToAllUsers(createNotificationDto.title, 'notification');
    } else if (createNotificationDto.userIds?.length) {
      const notificationUsers = createNotificationDto.userIds.map((userId) => ({
        notificationId: notification._id,
        userId: userId.toString(),
      }));
  
      await this.notificationUserModel.insertMany(notificationUsers);
  
      // gửi thông báo qua socket cá nhân từng người
      createNotificationDto.userIds.forEach((userId) => {
        this.websocketGateway.sendNotificationToUser({
          userId: userId.toString(),
          message: createNotificationDto.title,
          event: 'notification',
        });
      });
    }
    return notification;

  }

  async markAsRead(notificationId: string, userId: string) {
    const exists = await this.notificationUserModel.findOne({ notificationId, userId });
  
    if (!exists) {
      await this.notificationUserModel.create({
        notificationId,
        userId,
        isRead: true,
        readAt: new Date(),
      });
    } else {
      await this.notificationUserModel.updateOne({ notificationId, userId }, {
        isRead: true,
        readAt: new Date(),
      });
    }
  }

  async findAll(
    currentPage: number,
    limit: number,
    search: string,
    qs: string,
    user: IUser
  ) {
    const { filter, sort } = aqp(qs);
    const offset = (+currentPage - 1) * (+limit || 10);
    const defaultLimit = +limit || 10;
  
    const personalNotificationIds = await this.notificationUserModel.distinct('notificationId', {
      userId: new mongoose.Types.ObjectId(user._id),
    });
  
    const searchCondition = search 
      ? { title: { $regex: search, $options: 'i' } }
      : {};
  
    const finalFilter = {
      ...filter,
      ...searchCondition,
      isDeleted: { $ne: true },
      $or: [
        { isGlobal: true },
        ...(personalNotificationIds.length ? [{ _id: { $in: personalNotificationIds } }] : []),
      ],
    };
  
    const notifications = await this.notificationModel.aggregate([
      { $match: finalFilter },
      {
        $lookup: {
          from: 'notificationusers',
          let: { notificationId: '$_id' },
          pipeline: [
            { $match: { userId: new mongoose.Types.ObjectId(user._id) } },
            { $match: { $expr: { $eq: ['$$notificationId', '$notificationId'] } } },
          ],
          as: 'userReadStatus',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy._id',
          foreignField: '_id',
          as: 'createdByUser',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                avatar: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          isRead: {
            $cond: {
              if: { $gt: [{ $size: '$userReadStatus' }, 0] },
              then: { $arrayElemAt: ['$userReadStatus.isRead', 0] },
              else: false,
            },
          },
          readAt: {
            $arrayElemAt: ['$userReadStatus.readAt', 0],
          },
          createdBy: {
            $arrayElemAt: ['$createdByUser', 0]
          }
        },
      },
      { $sort: sort || { createdAt: -1 } as any },
      { $skip: offset },
      { $limit: defaultLimit },
      {
        $project: {
          title: 1,
          message: 1,
          type: 1,
          userIds: 1,
          isGlobal: 1,
          objInfo: 1,
          createdAt: 1,
          isRead: 1,
          isURL: 1,
          url: 1,
          readAt: 1,
          createdBy: 1
        },
      },
    ]);
  
    const total = await this.notificationModel.countDocuments(finalFilter);

    // Đếm số thông báo chưa đọc
    const unreadCount = await this.notificationModel.aggregate([
      { $match: finalFilter },
      {
        $lookup: {
          from: 'notificationusers',
          let: { notificationId: '$_id' },
          pipeline: [
            { $match: { userId: new mongoose.Types.ObjectId(user._id) } },
            { $match: { $expr: { $eq: ['$$notificationId', '$notificationId'] } } }
          ],
          as: 'userReadStatus',
        },
      },
      {
        $match: {
          $or: [
            { userReadStatus: { $size: 0 } },
            { 'userReadStatus.isRead': false }
          ]
        }
      },
      { $count: 'total' }
    ]);
  
    return {
      current: currentPage,
      pageSize: notifications.length,
      pages: Math.ceil(total / defaultLimit),
      total,
      items: notifications,
      unreadCount: unreadCount[0]?.total || 0
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID Không tồn tại');
    }
    return this.notificationModel.findById(id);
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, user: IUser) {
      if (!mongoose.Types.ObjectId.isValid(id))
        throw new BadRequestException('ID Không tồn tại');

      return await this.notificationModel.updateOne(
        { _id: id },
        {
          ...updateNotificationDto,
          updatedBy: { _id: user._id, email: user.email },
        },
      );
  }

  async remove(id: string, user: IUser) {
    const notification = await this.notificationModel.findById(id);
    if (!notification) throw new BadRequestException('ID Không tồn tại');

    await this.notificationModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.notificationModel.softDelete({ _id: id });
  }
}
