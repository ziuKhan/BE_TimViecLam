import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateConversationDto, CreateMessageDto, CheckOneToOneConversationDto } from './dto/create-message.dto';
import { MarkAsReadDto, UpdateConversationDto, UpdateMessageDto } from './dto/update-message.dto';
import { IUser } from 'src/auth/users.interface';
import { ResponseMessage, User } from '../decorator/customize';
import { ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../dto/common-query.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ResponseMessage('Tạo cuộc trò chuyện thành công')
  createConversation(@Body() createConversationDto: CreateConversationDto, @User() user: IUser) {
    return this.messagesService.createConversation(createConversationDto, user);
  }

  @Get('conversations')
  @ResponseMessage('Lấy danh sách cuộc trò chuyện thành công')
  getConversations(@User() user: IUser, @Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.messagesService.getConversationsByUser(user, +page, +pageSize, search, filter);
  }

  @Get('conversations/:id')
  @ResponseMessage('Lấy thông tin cuộc trò chuyện thành công')
  getConversation(@Param('id') id: string, @User() user: IUser) {
    return this.messagesService.getConversationById(id, user);
  }

  @Post('check-one-to-one')
  @ResponseMessage('Kiểm tra hội thoại 1-1 thành công')
  checkOneToOneConversation(@Body() checkDto: CheckOneToOneConversationDto, @User() user: IUser) {
    return this.messagesService.checkOneToOneConversation(checkDto.otherUserId, user);
  }

  @Get('conversations/:id/messages')
  @ResponseMessage('Lấy danh sách tin nhắn thành công')
  getConversationMessages(
    @Param('id') conversationId: string,
    @User() user: IUser,
    @Query() query: CommonQueryDto
  ) {
    const { page, pageSize } = query;
    return this.messagesService.getMessagesByConversation(conversationId, user, +page, +pageSize);
  }

  @Post('send')
  @ResponseMessage('Gửi tin nhắn thành công')
  sendMessage(@Body() createMessageDto: CreateMessageDto, @User() user: IUser) {
    return this.messagesService.sendMessage(createMessageDto, user);
  }

  @Patch('conversations/:id/read')
  @ResponseMessage('Đánh dấu tin nhắn đã đọc thành công')
  markAsRead(
    @Param('id') conversationId: string,
    @Body() markAsReadDto: MarkAsReadDto,
    @User() user: IUser
  ) {
    return this.messagesService.markMessageAsRead(conversationId, markAsReadDto.messageId, user);
  }

  @Patch('conversations/:id')
  @ResponseMessage('Cập nhật cuộc trò chuyện thành công')
  updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @User() user: IUser
  ) {
    return this.messagesService.updateConversation(id, updateConversationDto, user);
  }

  @Delete('conversations/:id')
  @ResponseMessage('Xóa cuộc trò chuyện thành công')
  removeConversation(@Param('id') id: string, @User() user: IUser) {
    return this.messagesService.removeConversation(id, user);
  }
}
