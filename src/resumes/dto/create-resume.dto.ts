import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Vui lòng điền email' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng điền userId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Vui lòng điền name' })
  url: string;

  @IsNotEmpty({ message: 'Vui lòng điền status' })
  status: string;

  @IsNotEmpty({ message: 'Vui lòng điền companyId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Vui lòng điền jobId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCVDto {
  @IsNotEmpty({ message: 'Vui lòng điền name' })
  url: string;

  status: string;

  @IsNotEmpty({ message: 'Vui lòng điền companyId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Vui lòng điền jobId' })
  @IsMongoId({ message: 'Không đúng định dạng ID' })
  jobId: mongoose.Schema.Types.ObjectId;
}
