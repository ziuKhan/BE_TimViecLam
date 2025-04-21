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
import {
  RegisterHRUserDto,
  RegisterUserDto,
  UserLoginDto,
} from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { GoogleAuthGuard } from './google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successfully')
  @ApiBody({ type: UserLoginDto })
  @Public()
  @Post('/login')
  handleLogin(
    @RequestType() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Public()
  @ResponseMessage('Login successfully')
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @RequestType() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const data = await this.authService.login(user, res);
    const redirectUrl = `http://localhost:5000/login/${data.access_token}`;
    return res.redirect(redirectUrl);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(ThrottlerGuard)
  @ResponseMessage('Get User by access token')
  @Get('/account')
  async getAccount(@User() user: IUser) {
    delete user.permissions;
    return user;
  }

  @ResponseMessage('Get User by access token')
  @Get('/permission')
  async getPermission(@User() user: IUser) {
    return user.permissions;
  }

  @ResponseMessage('Get User by access token')
  @Get('/profile')
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
  @Post('/customer/register')
  @ResponseMessage('Register a new HR user')
  registerHR(@Body() registerHRUserDto: RegisterHRUserDto) {
    return this.authService.register(registerHRUserDto);
  }
  @Public()
  @Post('/customer/company')
  @ResponseMessage('Register a new HR user')
  createCompanyHR(@Body() createCompanyDto: CreateCompanyDto) {
    return this.authService.createCompanyHR(createCompanyDto);
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
  @Post('/logout')
  @ResponseMessage('Logout successfully')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
