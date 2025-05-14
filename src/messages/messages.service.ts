import { Injectable } from '@nestjs/common';
import { CreateConversationDto, CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { ConversationParticipant, ConversationParticipantDocument } from './schemas/conversation-participant.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '../auth/users.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: SoftDeleteModel<ConversationDocument>,
    @InjectModel(ConversationParticipant.name) private conversationParticipantModel: SoftDeleteModel<ConversationParticipantDocument>,
  ) {}

  


  async createConversation(createConversationDto: CreateConversationDto, user: IUser) {
    const conversation = await this.conversationModel.create({
      ...(createConversationDto.conversationName && { name: createConversationDto.conversationName }),
      createdBy: { _id: user._id, email: user.email },
    });

    const message = await this.messageModel.create({
      ...createConversationDto.message,
      statusByRecipient: [user._id],
      createdBy: { _id: user._id, email: user.email },
    });

    createConversationDto.userId.push(user._id);
    createConversationDto.userId.forEach(async (userId) => {
      await this.conversationParticipantModel.create({
        conversationId: conversation._id,
        userId: userId,
        unreadCount: userId === user._id ? 0 : 1,
         ...(userId === user._id && { lastReadMessageId: message._id, }),
        constraint: `${conversation._id}-${userId}`,
        createdBy: { _id: user._id, email: user.email },
      });
    });
    return conversation;
  }



  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
