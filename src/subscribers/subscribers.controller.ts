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
import { CommonQueryDto } from '../dto/common-query.dto';

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

  @Post('client')
  @ResponseMessage('Successfully')
  createOrUpdateCLient(
    @Body() createSubscribersDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.createOrUpdate(createSubscribersDto, user);
  }
  @Get()
  @ResponseMessage('Get list Subscribers successfully')
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.subscribersService.findAll(+page, +pageSize, search, filter);
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

  @Get('/client/:id')
  @ResponseMessage('Get Subscribers successfully')
  findOneByEmailClient(@Param('id') email: string) {
    return this.subscribersService.findOneByEmail(email);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage('Update Subscribers successfully')
  update(
    @Body() updateSubscribersDto: UpdateSubscriberDto,
    @User() user: IUser,
    @Param('id') email: string,
  ) {
    return this.subscribersService.update(updateSubscribersDto, user, email);
  }

  @Delete(':id')
  @ResponseMessage('Delete Subscribers successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
