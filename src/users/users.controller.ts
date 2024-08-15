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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/auth/users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create user successfully!')
  create(
    //tag @Body là request.body trong NestJS
    //cách khai báo: @Body() (tên biến): (kiểu dữ liệu),
    @Body() createUserDto: CreateUserDto, //kiểu dữ liệu là 1 class,
    @User() user: IUser,
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage('Get list user successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get('by=:id')
  @ResponseMessage('Fetch user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); //dấu + là đang chuyển string sang number nhưng ko cần vì muốn giữ string
  }

  @ResponseMessage('Update user successfully!')
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @ResponseMessage('Update user successfully!')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
