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
    
    // Tách chuỗi thành các phần key=value dựa trên dấu phẩy
    const parts = value.split(',');
    const result = [];
    let currentPart = '';
    
    for (const part of parts) {
      if (currentPart === '') {
        currentPart = part;
      } else if (part.includes('=')) {
        // Nếu phần này chứa dấu "=" thì đây là một cặp key-value mới
        result.push(currentPart);
        currentPart = part;
      } else {
        // Nếu không chứa "=" thì đây là một phần của giá trị trước đó
        currentPart += ',' + part;
      }
    }
    
    // Đảm bảo phần cuối cùng được thêm vào kết quả
    if (currentPart !== '') {
      result.push(currentPart);
    }
    
    // Nối các phần lại với nhau bằng dấu "&"
    return result.join('&');
  })
  filter?: string = '';
}