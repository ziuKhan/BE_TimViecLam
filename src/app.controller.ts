import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('home.ejs')
  getHello() {
    const name1 = this.appService.getHello();
    return { name: name1 };
  }
}
