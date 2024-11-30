import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Public, ResponseMessage } from '../decorator/customize';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}


  @Get()
  findAll() {
    return this.statisticsService.findAll();
  }

  @Get('company-growth-rate')
  @ResponseMessage('Get company growth rate')
  @Public()
  calculateCompanyGrowthRate() {  
    return this.statisticsService.calculateCompanyGrowthRate();
  }

}
