import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscriptionPackageService } from './subscription-package.service';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';
import { User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { CommonQueryDto } from '../dto/common-query.dto';

@Controller('subscription-package')
export class SubscriptionPackageController {
  constructor(private readonly subscriptionPackageService: SubscriptionPackageService) {}

  @Post()
  create(@Body() createSubscriptionPackageDto: CreateSubscriptionPackageDto, @User() user: IUser) {
    return this.subscriptionPackageService.create(createSubscriptionPackageDto, user);
  }

  @Get()
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.subscriptionPackageService.findAll(+page, +pageSize, search, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPackageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionPackageDto: UpdateSubscriptionPackageDto, @User() user: IUser) {
    return this.subscriptionPackageService.update(id, updateSubscriptionPackageDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscriptionPackageService.remove(id, user);
  }
}
