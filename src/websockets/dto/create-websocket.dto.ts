import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateWebsocketDto {
  @IsNotEmpty()
  @IsMongoId({message: 'UserId phải là mã id'})
  userId: string;

  @IsNotEmpty()
  @IsString({message: 'Message phải là string'})
  message: string;

  @IsNotEmpty()
  @IsString({message: 'Event phải là string'})
  event: string;
}
