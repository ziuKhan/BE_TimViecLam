import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import fs from 'fs';
import { FilesService } from './ﬁles.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Post('upload')
  @ResponseMessage('File uploaded successfully')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Kiểm tra thêm các lỗi khác nếu cần
      // Ví dụ, kiểm tra định dạng hoặc kích thước
      if (!/^(image\/png|image\/jpeg|application\/pdf)$/.test(file.mimetype)) {
        throw new HttpException(
          'Unsupported file type',
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }

      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        throw new HttpException('File too large', HttpStatus.PAYLOAD_TOO_LARGE);
      }

      return { filename: file.filename };
    } catch (error) {
      // Xoá file nếu có lỗi xảy ra
      if (file && file.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully:', file.path);
          }
        });
      }
      throw error;
    }
  }
}
