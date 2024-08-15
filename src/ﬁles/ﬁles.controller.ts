import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import fs from 'fs';
import { FilesService } from './ﬁles.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // Upload 1 file
  @Public()
  @Post('upload')
  @ResponseMessage('File uploaded successfully')
  @UseInterceptors(FileInterceptor('fileUpload'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Kiểm tra định dạng hoặc kích thước
      if (
        !/^(image\/png|image\/jpg|image\/jpeg|application\/pdf|application\/docx|application\/text|application\/doc)$/.test(
          file.mimetype,
        )
      ) {
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

  // Upload nhiều file
  @Public()
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const failedFiles = [];

    try {
      for (const file of files) {
        if (!file) {
          failedFiles.push(file);
          continue;
        }

        // Kiểm tra định dạng hoặc kích thước
        if (
          !/^(image\/png|image\/jpeg|application\/pdf)$/.test(file.mimetype)
        ) {
          failedFiles.push(file);
          continue;
        }

        if (file.size > 1 * 1024 * 1024) {
          // 1MB
          failedFiles.push(file);
          continue;
        }

        console.log('File uploaded:', file);
      }

      if (failedFiles.length > 0) {
        throw new HttpException(
          `Some files failed to upload: ${failedFiles
            .map((f) => f.originalname)
            .join(', ')}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      return {
        files: files.map((file) => ({ filename: file.filename })),
      };
    } catch (error) {
      // Xoá các file đã lưu nếu có lỗi xảy ra
      for (const file of files) {
        if (file && file.path) {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully:', file.path);
            }
          });
        }
      }
      throw error;
    }
  }
}
