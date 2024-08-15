import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Res,
  Req,
  Request as RequestType,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { IUser } from './users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successfully')
  @Post('/login')
  handleLogin(
    @RequestType() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  // @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get User by access token')
  @Get('account')
  getProfile(@User() user: IUser) {
    return user;
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Register a new user')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Get User by refresh token')
  handleRefresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  // @Public()
  @Get('/logout')
  @ResponseMessage('Logout successfully')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    
    return  this.authService.logout(response,user);;
  }
}
