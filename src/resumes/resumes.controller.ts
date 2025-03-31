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
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCVDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/auth/users.interface';
import { ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../dto/common-query.dto';

@ApiTags('Resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ResponseMessage('Create resume successfully')
  @Post()
  create(@Body() createUserCVDto: CreateUserCVDto, @User() user: IUser) {
    return this.resumesService.create(createUserCVDto, user);
  }
  @ResponseMessage('Create resume successfully')
  @Post('client')
  createClient(@Body() createUserCVDto: CreateUserCVDto, @User() user: IUser) {
    return this.resumesService.create(createUserCVDto, user);
  }
  @ResponseMessage('Get all resumes successfully')
  @Get('client')
  @Public()
  findAllClient(
    @Query() query: CommonQueryDto
  ) {
    const { page, pageSize, search, filter } = query;
    return this.resumesService.findAll(+page, +pageSize, search, filter);
  }
  @ResponseMessage('Get all resumes successfully')
  @Get()
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.resumesService.findAll(+page, +pageSize, search, filter);
  }
  @ResponseMessage('Get resume successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage('Get resumes by user successfully')
  @Post('by-user')
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUser(user);
  }

  @ResponseMessage('Update resume successfully')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @ResponseMessage('Delete resume successfully')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
