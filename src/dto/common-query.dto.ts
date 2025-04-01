import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommonQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '1')
  page?: string = '1';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '10')
  pageSize?: string = '10';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '')
  search?: string = '';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return '';
    return value.replace(/,/g, '&');
  })
  filter?: string = '';
}