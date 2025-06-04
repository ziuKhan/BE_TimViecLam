import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum StatisticsTimeUnit {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
}

export class StatisticsQueryDto {
  @IsOptional()
  @IsEnum(StatisticsTimeUnit)
  @Transform(({ value }) => value?.toLowerCase())
  timeUnit?: StatisticsTimeUnit = StatisticsTimeUnit.MONTH;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
} 