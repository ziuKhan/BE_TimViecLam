import { Injectable } from '@nestjs/common';

@Injectable() //đây là decurator
export class AppService {
  getHello(): string {
    return 'Hello World! Khang nè';
  }
}
