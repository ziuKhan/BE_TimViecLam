import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
  } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/auth/users.interface';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

  @ApiTags('Notifications')
  @Controller('notifications')
  export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) {}

    @Post()
    @ResponseMessage('Create job successfully')
    async create(@Body() createNotificationDto: CreateNotificationDto, @User() user: IUser) {
      const createJob = await this.notificationsService.create(createNotificationDto, user);
      this.notificationsGateway.sendNotificationToAllUsers("Create successfully");
      return createJob;
    }

    @Post('user')
    @ResponseMessage('Tạo thông báo thành công')
    async createByUser(@Body() createNotificationDto: CreateNotificationDto, @User() user: IUser) {
      const createdNotification = await this.notificationsService.create(createNotificationDto, user);
      // Gửi thông báo cho người dùng cụ thể
      this.notificationsGateway.sendNotificationToUser(
        createNotificationDto.userId,
        "Thông báo mới đã được tạo"
      );
      return createdNotification;
    }

    @Get()
    @ResponseMessage('Get list job successfully')
    findAll(
      @Query('current') currentPage: string,
      @Query('pageSize') limit: string,
      @Query('gte') gte: string,
      @Query('lte') lte: string,
      @Query() qs: string,
    ) {
      return this.notificationsService.findAll(+gte, +lte, +currentPage, +limit, qs);
    }
  
    @Get(':id')
    @ResponseMessage('Get job successfully')
    findOne(@Param('id') id: string) {
      return this.notificationsService.findOne(id);
    }
  
    @Patch(':id')
    @ResponseMessage('Update job successfully')
    update(
      @Param('id') id: string,
      @Body()updateNotificationDto:UpdateNotificationDto,
      @User() user: IUser,
    ) {
      const updateJob = this.notificationsService.update(id, updateNotificationDto, user);
      this.notificationsGateway.sendNotificationToAllUsers("update successfully");
      return updateJob
    }

    @Delete(':id')
    @ResponseMessage('Delete job successfully')
    remove(@Param('id') id: string, @User() user: IUser) {
      const remove = this.notificationsService.remove(id, user);
      this.notificationsGateway.sendNotificationToAllUsers("delete successfully");
      return remove
    }

}
  