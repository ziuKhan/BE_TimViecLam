import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from '../../companies/schemas/company.schema';
import { Skill } from '../../skills/Schemas/skill.schema';
import { User } from '../../users/schemas/user.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' })
  conversationId: mongoose.Schema.Types.ObjectId; //Cuộc trò chuyện

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  senderId: mongoose.Schema.Types.ObjectId; //Người gửi

  @Prop({ type: String, enum: ['text', 'file', 'image', 'system'] })
  contentType: string;

  @Prop({ type: String })
  textContent: string;

  @Prop({ type: String })
  file_name: string;

  @Prop({ type: Number })
  file_size: number;
  
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: User.name })
  statusByRecipient: mongoose.Schema.Types.ObjectId[]; //Trạng thái của người nhận

  
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

export const MessageSchema = SchemaFactory.createForClass(Message);
