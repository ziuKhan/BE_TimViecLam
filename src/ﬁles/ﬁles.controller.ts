import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
  UploadedFiles,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import fs from 'fs';
import { FilesService } from './ﬁles.service';
import { ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/core/http-exception.filter';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // Upload 1 file
  @Public()
  @Post('upload')
  @ResponseMessage('File uploaded successfully')
  @UseInterceptors(FileInterceptor('fileUpload'))
  @UseFilters(new HttpExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { fileName: file.filename };
  }
}
