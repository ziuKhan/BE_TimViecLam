import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  @Render('home.ejs')
  getHello() {
    console.log('>>> check port: ', this.configService.get<string>('PORT'));
    const name1 = this.appService.getHello();
    return { name: name1 };
  }
}
