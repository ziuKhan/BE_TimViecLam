import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
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

export class TaxStatisticsQueryDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  year: number;
} 