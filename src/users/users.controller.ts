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
import { ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../dto/common-query.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create user successfully!')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user); 
  }

  @Get()
  @ResponseMessage('Get list user successfully')
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.usersService.findAll(+page, +pageSize, search, filter);
  }

  @Public()
  @Get('/client/:id')
  @ResponseMessage('Fetch user by id')
  findOneClient(@Param('id') id: string) {
    return this.usersService.findOne(id); 
  }
  @Get(':id')
  @ResponseMessage('Fetch user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); 
  }

  @ResponseMessage('Update user successfully!')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }
  @ResponseMessage('Update user successfully!')
  @Patch('/client/:id')
  updateClient(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }
  @ResponseMessage('Update user successfully!')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Post('/change-password')
  @ResponseMessage('Change password user successfully!')
  changePassword(
    @Body() objectPass: { password: string; newPassword: string },
    @User() user: IUser,
  ) {
    return this.usersService.changePassword(objectPass, user);
  }
}
 