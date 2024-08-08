import { Controller, Delete, Get } from '@nestjs/common';

@Controller('user') // route /user
export class UserController {
  @Get() //GET => http://localhost:3000/user
  findAll(): string {
    return 'This action return all users';
  }

  @Delete('/by-id') //DeLETE => http://localhost:3000/user/by-id
  findById(): string {
    return 'This action will delete a user by id';
  }
}
