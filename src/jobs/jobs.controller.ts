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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/auth/users.interface';
import { ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../dto/common-query.dto';
@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create job successfully')
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Get('client')
  @Public()
  @ResponseMessage('Get list job successfully')
  findAllClient(
    @Query() query: CommonQueryDto
  ) {
    const { page, pageSize, search, filter } = query;
    return this.jobsService.findAll(+page, +pageSize, search, filter);
  }

  
  @Get()
  @ResponseMessage('Get list job successfully')
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.jobsService.findAll(+page, +pageSize, search, filter);
  }


  @Public()
  @Get('client/:id')
  @ResponseMessage('Get job successfully')
  findOneClient(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
  @Get(':id')
  @ResponseMessage('Get job successfully')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
  @Patch(':id')
  @ResponseMessage('Update job successfully')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete job successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
