import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Conversation } from './conversation.schema';
import { User } from '../../users/schemas/user.schema';
import { Message } from './message.schema';

export type ConversationParticipantDocument = HydratedDocument<ConversationParticipant>;

@Schema({ timestamps: true })
export class ConversationParticipant {//Người tham gia cuộc trò chuyện

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Conversation.name, nullable: true })
  conversationId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, nullable: true })
  userId: mongoose.Schema.Types.ObjectId; //Người tham gia

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Message.name, nullable: true })
  lastReadMessageId: mongoose.Schema.Types.ObjectId; //Tin nhắn cuối cùng đã đọc

  @Prop({ type: Number, default: 0 })
  unreadCount: number; //Số lượng tin nhắn chưa đọc

  @Prop({ type: Boolean, default: false })
  isArchived: boolean; //Xác định tin nhắn có ẩn không

  @Prop({ type: String, unique: true })
  constraint: string; //Kiểm tra có tồn tại trong conversation hay không

  //----------------------------------
  //----------------------------------
  //----------------------------------
  @Prop({ type: Object })
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

export const ConversationParticipantSchema = SchemaFactory.createForClass(ConversationParticipant);
