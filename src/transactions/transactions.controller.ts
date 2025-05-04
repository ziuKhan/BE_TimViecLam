import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Public, User } from '../decorator/customize';
import { CommonQueryDto } from '../dto/common-query.dto';
import { IUser } from '../auth/users.interface';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @User() user: IUser) {
    return this.transactionsService.create(createTransactionDto, user);
  }

  @Get()
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.transactionsService.findAll(+page, +pageSize, search, filter);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }

  @Public()
  @Post('receive-hook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() webhookData: any) {
    return this.transactionsService.handleWebhook(webhookData);
  }
}
