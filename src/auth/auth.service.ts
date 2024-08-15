import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from './users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, passport: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) return null;

    if (await this.usersService.isValidPassword(passport, user.password))
      return user;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
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
      user: { _id, name, email, role },
    };
  }

  register(registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  createRefreshToken = (payload) => {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
  };

  processNewToken = async (reference: string, response: Response) => {
    try {
      this.jwtService.verify(reference, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.usersService.findUserByToken(reference);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refresh_Token = await this.createRefreshToken(payload);

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
          user: { _id, name, email, role },
        };
      } else {
        throw new BadRequestException('Refresh token hết hợp.');
      }
    } catch (err) {
      throw new BadRequestException('Refresh token đã hết hạn.', err);
    }
  };

  logout = (response: Response, user: IUser) => {
    response.clearCookie('refresh_token');
    this.usersService.updateUserToken('', user._id);
    return 'OK';
  };
}
