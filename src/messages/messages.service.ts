import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto, CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto, UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import mongoose from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { ConversationParticipant, ConversationParticipantDocument } from './schemas/conversation-participant.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';
import { WebsocketsService } from '../websockets/websockets.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: SoftDeleteModel<ConversationDocument>,
    @InjectModel(ConversationParticipant.name) private conversationParticipantModel: SoftDeleteModel<ConversationParticipantDocument>,
    private readonly websocketGateway: WebsocketsGateway,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto, user: IUser) {
    const conversation = await this.conversationModel.create({
      ...(createConversationDto.conversationName && { name: createConversationDto.conversationName }),
      createdBy: { _id: user._id, email: user.email },
    });

    const message = await this.messageModel.create({
      ...createConversationDto.message,
      conversationId: conversation._id,
      senderId: user._id,
      statusByRecipient: [user._id],
      createdBy: { _id: user._id, email: user.email },
    });

    await this.conversationModel.updateOne(
      { _id: conversation._id },
      { lastMessageId: message._id }
    );

    if (!createConversationDto.userId.includes(user._id)) {
      createConversationDto.userId.push(user._id);
    }

    for (const userId of createConversationDto.userId) {
      await this.conversationParticipantModel.create({
        conversationId: conversation._id,
        userId: userId,
        unreadCount: userId === user._id ? 0 : 1,
        ...(userId === user._id && { lastReadMessageId: message._id }),
        constraint: `${conversation._id}-${userId}`,
        createdBy: { _id: user._id, email: user.email },
      });
    }

    return {
      _id: conversation._id,
      name: conversation.name,
      createdAt: conversation.createdAt,
      message: {
        _id: message._id,
        content: message.textContent
      }
    };
  }

  async getConversationsByUser(user: IUser, currentPage: number, limit: number, search: string, qs: string) {
    const { filter, sort, population } = aqp(qs);
    
    const participants = await this.conversationParticipantModel.find({
      userId: user._id,
      isDeleted: false
    });
    
    const conversationIds = participants.map(p => p.conversationId);
    
    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } }
      ];
    }
    
    filter._id = { $in: conversationIds };
    filter.isDeleted = false;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit || 10;

    const totalItems = (await this.conversationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const conversations = await this.conversationModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any || { updatedAt: -1 })
      .populate({
        path: 'lastMessageId',
        model: Message.name,
        select: 'textContent contentType senderId createdAt'
      });

    const result = await Promise.all(conversations.map(async (conversation) => {
      const participant = participants.find(p => 
        p.conversationId.toString() === conversation._id.toString()
      );
      
      return {
        _id: conversation._id,
        name: conversation.name,
        lastMessage: conversation.lastMessageId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        unreadCount: participant?.unreadCount || 0
      };
    }));

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async getConversationById(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID cuộc trò chuyện không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: id,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    const conversation = await this.conversationModel.findById(id)
      .populate({
        path: 'lastMessageId',
        model: Message.name,
        select: 'textContent contentType senderId createdAt'
      });

    if (!conversation) {
      throw new BadRequestException('Cuộc trò chuyện không tồn tại');
    }

    const participants = await this.conversationParticipantModel.find({
      conversationId: id,
      isDeleted: false
    });

    return {
      _id: conversation._id,
      name: conversation.name,
      lastMessage: conversation.lastMessageId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participantsCount: participants.length,
      unreadCount: participant.unreadCount
    };
  }

  async getMessagesByConversation(conversationId: string, user: IUser, currentPage: number, limit: number) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('ID cuộc trò chuyện không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: conversationId,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit || 20;

    const totalItems = await this.messageModel.countDocuments({
      conversationId: conversationId,
      isDeleted: false
    });
    
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const messages = await this.messageModel
      .find({
        conversationId: conversationId,
        isDeleted: false
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(defaultLimit);

    const result = messages.map(message => ({
      _id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      contentType: message.contentType,
      textContent: message.textContent,
      file_name: message.file_name,
      file_size: message.file_size,
      isRead: message.statusByRecipient.includes(user._id as any),
      createdAt: message.createdAt
    }));

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async sendMessage(createMessageDto: CreateMessageDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(createMessageDto.conversationId)) {
      throw new BadRequestException('ID cuộc trò chuyện không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: createMessageDto.conversationId,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
    }

    const message = await this.messageModel.create({
      ...createMessageDto,
      senderId: user._id,
      statusByRecipient: [user._id],
      createdBy: { _id: user._id, email: user.email }
    });

    await this.conversationModel.updateOne(
      { _id: createMessageDto.conversationId },
      { 
        lastMessageId: message._id,
        updatedBy: { _id: user._id, email: user.email }
      }
    );

    await this.conversationParticipantModel.updateMany(
      {
        conversationId: createMessageDto.conversationId,
        userId: { $ne: user._id }
      },
      { $inc: { unreadCount: 1 } }
    );

    const participants = await this.conversationParticipantModel.find({
      conversationId: createMessageDto.conversationId,
      isDeleted: false
    });

    participants.forEach(participant => {
      if (participant.userId.toString() !== user._id) {
        this.websocketGateway.sendNotificationToUser({
          userId: participant.userId.toString(),
          event: 'new_message',
          message: JSON.stringify({
            conversationId: message.conversationId,
            messageId: message._id,
            senderId: message.senderId,
            content: message.textContent,
            contentType: message.contentType
          })
        });
      }
    });

    return {
      _id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      contentType: message.contentType,
      textContent: message.textContent,
      createdAt: message.createdAt
    };
  }

  async markMessageAsRead(conversationId: string, messageId: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: conversationId,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    const message = await this.messageModel.findOne({
      _id: messageId,
      conversationId: conversationId,
      isDeleted: false
    });

    if (!message) {
      throw new BadRequestException('Tin nhắn không tồn tại');
    }

    if (!message.statusByRecipient.includes(user._id as any)) {
      await this.messageModel.updateOne(
        { _id: messageId },
        { $push: { statusByRecipient: user._id } }
      );
    }

    await this.conversationParticipantModel.updateOne(
      { conversationId: conversationId, userId: user._id },
      { 
        lastReadMessageId: messageId,
        unreadCount: 0,
        updatedBy: { _id: user._id, email: user.email }
      }
    );

    this.websocketGateway.sendNotificationToUser({
      userId: message.senderId.toString(),
      event: 'message_read',
      message: JSON.stringify({
        conversationId: conversationId,
        messageId: messageId,
        userId: user._id
      })
    });

    return { success: true };
  }

  async updateConversation(id: string, updateConversationDto: UpdateConversationDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID cuộc trò chuyện không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: id,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền chỉnh sửa cuộc trò chuyện này');
    }

    const result = await this.conversationModel.updateOne(
      { _id: id },
      {
        ...updateConversationDto,
        updatedBy: { _id: user._id, email: user.email }
      }
    );

    return { 
      modifiedCount: result.modifiedCount,
      _id: id
    };
  }

  async removeConversation(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID cuộc trò chuyện không hợp lệ');
    }

    const participant = await this.conversationParticipantModel.findOne({
      conversationId: id,
      userId: user._id,
      isDeleted: false
    });

    if (!participant) {
      throw new BadRequestException('Bạn không có quyền xóa cuộc trò chuyện này');
    }

    await this.conversationModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } }
    );

    await this.conversationModel.softDelete({ _id: id });
    await this.messageModel.softDelete({ conversationId: id });
    await this.conversationParticipantModel.softDelete({ conversationId: id });

    return { success: true };
  }
}
