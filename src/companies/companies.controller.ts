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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { IUser } from 'src/auth/users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';
import { Company } from './schemas/company.schema';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get('/client')
  @Public()
  @ResponseMessage('Get list companies successfully')
  findAllClient(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ): Promise<{ meta: { current: number; pageSize: number; pages: number; total: number; }; result: Company[] }> {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }
  @Get()
  @ResponseMessage('Get list companies successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ): Promise<{ meta: { current: number; pageSize: number; pages: number; total: number; }; result: Company[] }> {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Fetch company by id')
  @Get('/client/:id')
  findOneClient(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
  @ResponseMessage('Fetch company by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
  @ResponseMessage('Update company successfully!')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @ResponseMessage('Delete company successfully!')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
