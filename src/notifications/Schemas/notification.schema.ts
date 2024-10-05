import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {

  @Prop()
  title: string; // Tiêu đề của thông báo

  @Prop()
  message: string; // Nội dung thông báo

  @Prop()
  type: string; // Loại thông báo (ví dụ: hệ thống, tin nhắn, khuyến mãi)
  @Prop()
  url: string; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId; // Người nhận thông báo

  @Prop()
  isRead: boolean; // Trạng thái đã đọc

  //----------------------------------
  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      email: { type: String },
    }
  })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
  

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
