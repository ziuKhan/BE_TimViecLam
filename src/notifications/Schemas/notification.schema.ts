import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop()
  title: string;

  @Prop()
  message: string; 

  @Prop()
  type: string;

  @Prop()
  isGlobal: boolean;

  @Prop({ default: true })
  isURL: boolean;

  @Prop()
  url: string;

  @Prop({ type: Object })
  objInfo: {
    _id: mongoose.Schema.Types.ObjectId;
    type: string;
    name: string;
  };

  //----------------------------------
  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      email: { type: String },
    },
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
