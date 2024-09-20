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
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import {
  Public,
  ResponseMessage,
  SkipCheckPermission,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/auth/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  @ResponseMessage('Create Subscribers successfully')
  create(
    @Body() createSubscribersDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.create(createSubscribersDto, user);
  }

  @Post('create-or-update')
  @ResponseMessage('Successfully')
  createOrUpdate(
    @Body() createSubscribersDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.createOrUpdate(createSubscribersDto, user);
  }

  @Get()
  @ResponseMessage('Get list Subscribers successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @Post('skills')
  @ResponseMessage('Get subscribers by skills successfully')
  @SkipCheckPermission()
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Get(':id')
  @ResponseMessage('Get Subscribers successfully')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Get('/email/:id')
  @ResponseMessage('Get Subscribers successfully')
  findOneByEmail(@Param('id') email: string) {
    return this.subscribersService.findOneByEmail(email);
  }

  @Patch()
  @SkipCheckPermission()
  @ResponseMessage('Update Subscribers successfully')
  update(
    @Body() updateSubscribersDto: UpdateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscribersDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete Subscribers successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
