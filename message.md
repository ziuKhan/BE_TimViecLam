# Hệ thống tin nhắn (Message System)

## 1. Mục tiêu

Hệ thống tin nhắn trong dự án TimViecLam được phát triển nhằm:
- Tạo kênh giao tiếp trực tiếp giữa ứng viên và công ty đăng tải công việc
- Hỗ trợ trao đổi thông tin về vị trí tuyển dụng, lịch phỏng vấn và quá trình ứng tuyển
- Cung cấp trải nghiệm nhắn tin thời gian thực với thông báo tức thì
- Lưu trữ lịch sử hội thoại để tra cứu và tham khảo sau này
- Đảm bảo tính riêng tư trong quá trình giao tiếp giữa ứng viên và nhà tuyển dụng

## 2. Cấu trúc dữ liệu

### 2.1. Schemas

#### Conversation (Cuộc trò chuyện)
- **Mục đích**: Lưu trữ thông tin về cuộc trò chuyện giữa ứng viên và nhà tuyển dụng
- **Trường chính**:
  - `name`: Tên cuộc trò chuyện (thường là tên công việc hoặc tên công ty)
  - `lastMessageId`: ID của tin nhắn cuối cùng trong cuộc trò chuyện
  - `createdBy`, `updatedBy`, `deletedBy`: Thông tin người tạo/cập nhật/xóa
  - `createdAt`, `updatedAt`, `deletedAt`: Thời gian tạo/cập nhật/xóa
  - `isDeleted`: Trạng thái xóa logic

#### Message (Tin nhắn)
- **Mục đích**: Lưu trữ nội dung tin nhắn giữa các bên
- **Trường chính**:
  - `conversationId`: ID của cuộc trò chuyện
  - `senderId`: ID người gửi (ứng viên hoặc đại diện công ty)
  - `contentType`: Loại nội dung ('text', 'file', 'image', 'system')
  - `textContent`: Nội dung văn bản
  - `file_name`, `file_size`: Thông tin file đính kèm (nếu có)
  - `statusByRecipient`: Danh sách ID người đã xem tin nhắn
  - Các trường theo dõi (timestamps, người tạo/cập nhật/xóa)

#### ConversationParticipant (Người tham gia cuộc trò chuyện)
- **Mục đích**: Quản lý mối quan hệ giữa người dùng và cuộc trò chuyện
- **Trường chính**:
  - `conversationId`: ID cuộc trò chuyện
  - `userId`: ID người dùng tham gia (ứng viên hoặc đại diện công ty)
  - `lastReadMessageId`: ID tin nhắn cuối cùng đã đọc
  - `unreadCount`: Số tin nhắn chưa đọc
  - `isArchived`: Trạng thái lưu trữ cuộc trò chuyện
  - `constraint`: Chuỗi duy nhất kết hợp conversationId và userId
  - Các trường theo dõi (timestamps, người tạo/cập nhật/xóa)

### 2.2. DTOs

#### CreateMessageDto
- Định nghĩa cấu trúc dữ liệu để tạo tin nhắn mới
- Các trường chính: `contentType`, `conversationId`, `senderId`, `textContent`, `file_name`, `file_size`, `statusByRecipient`

#### CreateConversationDto
- Định nghĩa cấu trúc dữ liệu để tạo cuộc trò chuyện mới
- Các trường chính: `conversationName`, `userId` (danh sách người tham gia), `message` (tin nhắn đầu tiên)

## 3. Chức năng hiện tại và đề xuất

### 3.1. Chức năng hiện tại
- **Tạo cuộc trò chuyện mới**:
  - API: `POST /messages/conversation`
  - Tạo cuộc trò chuyện giữa ứng viên và nhà tuyển dụng
  - Tự động khởi tạo tin nhắn đầu tiên
  - Thiết lập các bản ghi người tham gia (ConversationParticipant)

### 3.2. Chức năng đề xuất
- **Quản lý cuộc trò chuyện**:
  ```typescript
  @Get('conversations')
  getConversations(@User() user: IUser) {
    return this.messagesService.getConversationsByUser(user);
  }
  ```

- **Quản lý tin nhắn**:
  ```typescript
  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id') conversationId: string,
    @User() user: IUser,
    @Query() pagination: PaginationDto
  ) {
    return this.messagesService.getMessagesByConversation(conversationId, user, pagination);
  }

  @Post('send')
  sendMessage(@Body() createMessageDto: CreateMessageDto, @User() user: IUser) {
    return this.messagesService.sendMessage(createMessageDto, user);
  }
  ```

- **Đánh dấu đã đọc**:
  ```typescript
  @Patch('conversations/:id/read')
  markAsRead(
    @Param('id') conversationId: string,
    @Body() messageInfo: { messageId: string },
    @User() user: IUser
  ) {
    return this.messagesService.markMessageAsRead(conversationId, messageInfo.messageId, user);
  }
  ```

## 4. Tính năng

### 4.1. Tính năng cơ bản
- Tạo cuộc trò chuyện mới giữa ứng viên và nhà tuyển dụng
- Gửi/nhận tin nhắn văn bản
- Xem lịch sử tin nhắn với phân trang
- Hiển thị trạng thái đã đọc/chưa đọc
- Đếm tin nhắn chưa đọc

### 4.2. Tính năng nâng cao
- **Nhắn tin thời gian thực** với WebSocket:
  - Nhận thông báo khi có tin nhắn mới
  - Cập nhật trạng thái đã đọc/chưa đọc theo thời gian thực
  - Hiển thị trạng thái "đang nhập" của người dùng

- **Đa phương tiện**:
  - Gửi/nhận hình ảnh và tệp đính kèm (Sử dụng module @files)
  - Giới hạn kích thước và định dạng tệp
  - Xem trước hình ảnh và tệp

- **Bảo mật và quyền riêng tư**:
  - Mã hóa nội dung tin nhắn
  - Giới hạn quyền truy cập chỉ cho người tham gia cuộc trò chuyện
  - Tùy chọn lưu trữ hoặc xóa cuộc trò chuyện

## 5. Luồng hoạt động

### 5.1. Tạo cuộc trò chuyện
1.Nhà tuyển dụng xem hồ sơ xin việc và nhấn "Liên hệ ứng viên"
2. Hệ thống tạo cuộc trò chuyện mới:
   - Tạo bản ghi Conversation
   - Tạo tin nhắn hệ thống đầu tiên (thông báo kết nối)
   - Thiết lập các ConversationParticipant cho ứng viên và nhà tuyển dụng
3. Hiển thị giao diện trò chuyện cho nhà tuyển dụng để bắt đầu trao đổi

### 5.2. Gửi tin nhắn
1. Người dùng nhập nội dung và nhấn gửi
2. Hệ thống lưu tin nhắn vào cơ sở dữ liệu
3. WebSocket thông báo cho người nhận về tin nhắn mới
4. Cập nhật giao diện người dùng hiển thị tin nhắn mới
5. Cập nhật số lượng tin nhắn chưa đọc cho người nhận

### 5.3. Đánh dấu đã đọc
1. Người dùng mở cuộc trò chuyện
2. Hệ thống cập nhật lastReadMessageId cho ConversationParticipant
3. Đặt lại unreadCount về 0
4. WebSocket thông báo cho người gửi rằng tin nhắn đã được đọc
5. Cập nhật giao diện hiển thị trạng thái đã đọc

## 6. Tích hợp với WebSockets

### 6.1. Cấu trúc WebSocket
- Sử dụng `@nestjs/websockets` và Socket.IO
- Gateway `WebsocketsGateway` quản lý các kết nối và sự kiện
- Service `WebsocketsService` xử lý logic WebSocket:
  - Quản lý kết nối người dùng
  - Gửi thông báo tin nhắn mới

### 6.2. Các sự kiện WebSocket
- **connection**: Khi người dùng kết nối, lưu trữ thông tin kết nối
- **disconnect**: Khi người dùng ngắt kết nối, cập nhật trạng thái
- **new_message**: Gửi thông báo khi có tin nhắn mới
- **message_read**: Cập nhật trạng thái đã đọc
- **typing**: Hiển thị trạng thái đang nhập của người dùng

### 6.3. Mã nguồn tích hợp
```typescript
// Trong MessagesService
async sendMessage(createMessageDto: CreateMessageDto, user: IUser) {
  // Lưu tin nhắn vào cơ sở dữ liệu
  const message = await this.messageModel.create({
    ...createMessageDto,
    senderId: user._id,
    createdBy: { _id: user._id, email: user.email },
  });
  
  // Cập nhật ConversationParticipant cho người nhận
  await this.conversationParticipantModel.updateMany(
    { 
      conversationId: createMessageDto.conversationId,
      userId: { $ne: user._id }
    },
    { $inc: { unreadCount: 1 } }
  );
  
  // Gửi thông báo qua WebSocket
  const conversation = await this.conversationModel.findById(createMessageDto.conversationId);
  const participants = await this.conversationParticipantModel.find({
    conversationId: createMessageDto.conversationId
  });
  
  // Gửi thông báo cho mỗi người tham gia (trừ người gửi)
  participants.forEach(participant => {
    if (participant.userId.toString() !== user._id) {
      // Sử dụng WebSocketService để gửi thông báo
      this.websocketService.sendNotificationToUser({
        userId: participant.userId.toString(),
        event: 'new_message',
        message: JSON.stringify(message)
      });
    }
  });
  
  return message;
}
```

## 7. Kết luận

Hệ thống tin nhắn cho dự án TimViecLam được thiết kế để tối ưu hóa giao tiếp giữa ứng viên và nhà tuyển dụng. Với cấu trúc dữ liệu hợp lý, tích hợp WebSocket cho trải nghiệm thời gian thực, hệ thống này sẽ nâng cao hiệu quả quá trình tuyển dụng và ứng tuyển. Các tính năng hiện tại và đề xuất đều hướng đến việc tạo ra một nền tảng giao tiếp an toàn, nhanh chóng và tiện lợi, phục vụ mục tiêu kết nối ứng viên và nhà tuyển dụng một cách hiệu quả.