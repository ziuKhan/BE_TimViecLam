import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Public, ResponseMessage } from '../decorator/customize';
import { StatisticsQueryDto, TaxStatisticsQueryDto } from './dto/statistics-query.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('company-growth-rate')
  @ResponseMessage('Thống kê tỷ lệ tăng trưởng công ty')
  @Public()
  calculateCompanyGrowthRate(@Query() query: StatisticsQueryDto) {  
    return this.statisticsService.calculateCompanyGrowthRate(query);
  }

  @Get('jobs-by-category')
  @ResponseMessage('Thống kê số lượng công việc theo trình độ')
  @Public()
  getTotalJobsByCategory(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getTotalJobsByCategory(query);
  }

  @Get('user-registration-stats')
  @ResponseMessage('Thống kê đăng ký người dùng')
  @Public()
  getUserRegistrationStats(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getUserRegistrationStats(query);
  }

  @Get('resume-submissions')
  @ResponseMessage('Thống kê nộp hồ sơ ứng tuyển')
  @Public()
  getResumeSubmissionStats(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getResumeSubmissionStats(query);
  }

  @Get('revenue')
  @ResponseMessage('Thống kê doanh thu')
  @Public()
  getRevenueStatistics(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getRevenueStatistics(query);
  }

  @Get('tax')
  @ResponseMessage('Thống kê thuế và doanh thu theo quý')
  @Public()
  @ApiQuery({ name: 'year', type: Number, required: true, example: 2024 })
  getTaxStatistics(@Query() query: TaxStatisticsQueryDto) {
    return this.statisticsService.getTaxStatistics(query);
  }
}
