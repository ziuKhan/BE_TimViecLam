import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VipHistoryService } from './vip-history.service';
import { CreateVipHistoryDto } from './dto/create-vip-history.dto';
import { UpdateVipHistoryDto } from './dto/update-vip-history.dto';
import { User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { CommonQueryDto } from '../dto/common-query.dto';
import { Cron } from '@nestjs/schedule';

@Controller('vip-history')
export class VipHistoryController {
  constructor(private readonly vipHistoryService: VipHistoryService) {}

  @Post()
  create(@Body() createVipHistoryDto: CreateVipHistoryDto, @User() user: IUser) {
    return this.vipHistoryService.create(createVipHistoryDto, user);
  }

  @Get()
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.vipHistoryService.findAll(+page, +pageSize, search, filter);
  }

  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.vipHistoryService.findByUser(id);
  }

  // Lấy gói VIP hiện tại của user
  @Get('current-vip/:id')
  getCurrentVip(@Param('id') id: string) {
    return this.vipHistoryService.getCurrentVip(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Query('status') status: string, @User() user: IUser) {
    return this.vipHistoryService.updateStatus(id, status, user);
  }

  @Get('check-and-update-expired-vip')
  @Cron('0 0 * * *')
  checkAndUpdateExpiredVip() {
    return this.vipHistoryService.checkAndUpdateExpiredVip();
  }
}
