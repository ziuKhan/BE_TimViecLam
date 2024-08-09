import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://khang123hy:khang123hy@cluster0.bj2kj.mongodb.net/213',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
