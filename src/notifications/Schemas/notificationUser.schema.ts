import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { HydratedDocument } from "mongoose";
export type NotificationUserDocument = HydratedDocument<NotificationUser>;

@Schema({ timestamps: true })
export class NotificationUser {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Notification', index: true })
  notificationId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false }) isRead: boolean;
  @Prop() readAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  isHidden: boolean;

  @Prop()
  hiddenAt: Date;
}

export const NotificationUserSchema = SchemaFactory.createForClass(NotificationUser);
