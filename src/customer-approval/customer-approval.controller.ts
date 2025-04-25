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
import { CustomerApprovalService } from './customer-approval.service';
import { CreateCustomerApprovalDto } from './dto/create-customer-approval.dto';
import { UpdateAcountSetupDto, UpdateCustomerApprovalDto } from './dto/update-customer-approval.dto';
import { Public, ResponseMessage, User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { CommonQueryDto } from '../dto/common-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer Approval')
@Controller('customer-approval')
export class CustomerApprovalController {
  constructor(
    private readonly customerApprovalService: CustomerApprovalService,
  ) {}

  @Post()
  @Public()
  create(@Body() createCustomerApprovalDto: CreateCustomerApprovalDto) {
    return this.customerApprovalService.create(createCustomerApprovalDto);
  }

  @Get()
  @ResponseMessage('Get list customerApproval successfully')
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.customerApprovalService.findAll(
      +page,
      +pageSize,
      search,
      filter,
    );
  }


  @ResponseMessage('Fetch customerApproval by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerApprovalService.findOne(id);
  }
  
  @ResponseMessage('Update customerApproval successfully!')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerApprovalDto: UpdateCustomerApprovalDto,
    @User() user: IUser,
  ) {
    return this.customerApprovalService.update(
      id,
      updateCustomerApprovalDto,
      user,
    );
  }

  @ResponseMessage('Delete customerApproval successfully!')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.customerApprovalService.remove(id, user);
  }

  @ResponseMessage('Update status customerApproval successfully!')
  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: string,
    @Body() updateCustomerApprovalDto: UpdateCustomerApprovalDto,
    @User() user: IUser,
  ) {
    return this.customerApprovalService.updateStatus(id, status, updateCustomerApprovalDto, user);
  }
  @ResponseMessage('Update account setup successfully')
  @Post('/setup')
  updateSetup(@Body() updateAcountSetupDto: UpdateAcountSetupDto, @User() user: IUser) {
    return this.customerApprovalService.UpdateAccountSetup(updateAcountSetupDto, user);
  }
}
