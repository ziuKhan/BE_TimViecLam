import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from './users.interface';
import {
  RegisterHRUserDto,
  RegisterUserDto,
} from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { Permission } from 'src/permissions/Schemas/permission.schema';
import { CompaniesService } from '../companies/companies.service';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
    private companiesService: CompaniesService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async validateUser(username: string, passport: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Tài khoản không tồn tại!');
    } else if (
      await this.usersService.isValidPassword(passport, user.password)
    ) {
      const userRole = user.role as unknown as { _id: string; name: string };
      const temp = await this.rolesService.findOne(userRole._id);
      return {
        ...user.toObject(),
        permissions: temp?.permissions ?? [],
        companyId: user.company?._id,
      };

    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions, avatar, companyId } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      avatar,
      email,
      role,
      companyId,
    };
    const refresh_Token = await this.createRefreshToken(payload);

    //update refresh token in database user
    await this.usersService.updateUserToken(refresh_Token, _id);

    //set refresh_token as cookies
    response.cookie('refresh_token', refresh_Token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        avatar,
        companyId,
      },
    };
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const { email, name, sub } = profile._json;
    // Kiểm tra xem người dùng đã tồn tại hay chưa
    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Nếu chưa, tạo người dùng mới
      user = await this.usersService.registerGoogleUser({
        name,
        email,
        googleId: sub,
      });
      user = await this.usersService.findOneByEmail(email);
    }

    const userRole = (await user.role) as unknown as {
      _id: string;
      name: string;
    };

    const temp = (await this.rolesService.findOne(userRole?._id))?.toObject();
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      companyId: user.company?._id,
      permissions: temp?.permissions ?? [],
    };
  }

  register(registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }
  createCompanyHR(createCompanyDto: CreateCompanyDto) {
    return this.companiesService.createHR(createCompanyDto);
  }

  registerHR(registerHRUserDto: RegisterHRUserDto) {
    return this.usersService.registerHR(registerHRUserDto);
  }

  createRefreshToken = (payload) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
  };

  processNewToken = async (reference: string, response: Response) => {
      this.jwtService.verify(reference, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.usersService.findUserByToken(reference);
      if (user) {
        const { _id, name, email, role, avatar } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          avatar,
          email,
          companyId: user.company?._id,
          role,
        };
        const refresh_Token = await this.createRefreshToken(payload);

        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        //update refresh token in database user
        await this.usersService.updateUserToken(refresh_Token, _id.toString());

        //set refresh_token as cookies
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refresh_Token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            avatar,
            role,
            companyId: user.company?._id,
          },
        };
      } else {
        throw new BadRequestException('LOGOUT');
      }
  };

  logout = (response: Response, user: IUser) => {
    response.clearCookie('refresh_token');
    this.usersService.updateUserToken('', user._id);
    return 'OK';
  };
}
