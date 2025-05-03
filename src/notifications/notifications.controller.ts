import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ResponseMessage, User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { CommonQueryDto } from '../dto/common-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @User() user: IUser) {
    return this.notificationsService.create(createNotificationDto, user);
  }

  @Get()
  findAll(@Query() query: CommonQueryDto, @User() user: IUser) {
    const { page, pageSize, search, filter } = query;
    return this.notificationsService.findAll(+page, +pageSize, search, filter, user);
  }

  @Get('markAsRead/:id')
  @ResponseMessage('Đọc thông báo thành công')
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.markAsRead(id, user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @User() user: IUser) {
    return this.notificationsService.update(id, updateNotificationDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.remove(id, user);
  }

  @Delete('hide/:id')
  @ResponseMessage('Xóa thông báo thành công')
  removeByUser(@Param('id') id: string, @User() user: IUser) {
    return this.notificationsService.removeByUser(id, user);
  }
}
