# Luồng trao đổi tin nhắn giữa nhà tuyển dụng và ứng viên

## Bối cảnh

Nhà tuyển dụng muốn liên hệ với ứng viên đã gửi CV để trao đổi thêm thông tin về vị trí việc làm, lịch phỏng vấn và các vấn đề liên quan đến quá trình tuyển dụng.

## Luồng hoạt động

### 1. Khởi tạo cuộc trò chuyện

#### Bước 1: Nhà tuyển dụng xem hồ sơ ứng viên
- Nhà tuyển dụng xem danh sách CV đã được gửi đến công việc họ đang tuyển
- Chọn ứng viên muốn liên hệ và nhấn nút "Liên hệ với ứng viên"

#### Bước 2: Hệ thống tạo cuộc trò chuyện mới
- Frontend gọi API tạo cuộc trò chuyện
- API: `POST /messages/conversation`
- Dữ liệu gửi đi:
```json
{
  "conversationName": "Tuyển dụng vị trí Frontend Developer",
  "userId": ["id-của-ứng-viên"],
  "message": {
    "contentType": "text",
    "textContent": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer."
  }
}
```
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Tạo cuộc trò chuyện thành công",
  "data": {
    "_id": "conversation-id",
    "name": "Tuyển dụng vị trí Frontend Developer",
    "createdAt": "2023-05-20T10:30:00.000Z",
    "message": {
      "_id": "message-id",
      "content": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer."
    }
  }
}
```

#### Bước 3: Thông báo cho ứng viên
- WebSocket gửi thông báo đến ứng viên về tin nhắn mới
- Sự kiện: `new_message`
- Dữ liệu sự kiện:
```json
{
  "conversationId": "conversation-id",
  "messageId": "message-id",
  "senderId": "id-của-nhà-tuyển-dụng",
  "content": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer.",
  "contentType": "text"
}
```

### 2. Ứng viên xem tin nhắn

#### Bước 1: Ứng viên nhận thông báo và mở ứng dụng
- Ứng viên nhận thông báo về tin nhắn mới
- Ứng viên mở ứng dụng và vào trang tin nhắn

#### Bước 2: Hiển thị danh sách cuộc trò chuyện
- Frontend gọi API lấy danh sách cuộc trò chuyện
- API: `GET /messages/conversations?page=1&pageSize=10`
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách cuộc trò chuyện thành công",
  "data": {
    "meta": {
      "current": 1,
      "pageSize": 10,
      "pages": 1,
      "total": 1
    },
    "result": [
      {
        "_id": "conversation-id",
        "name": "Tuyển dụng vị trí Frontend Developer",
        "lastMessage": {
          "_id": "message-id",
          "textContent": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer.",
          "contentType": "text",
          "senderId": "id-của-nhà-tuyển-dụng",
          "createdAt": "2023-05-20T10:30:00.000Z"
        },
        "createdAt": "2023-05-20T10:30:00.000Z",
        "updatedAt": "2023-05-20T10:30:00.000Z",
        "unreadCount": 1
      }
    ]
  }
}
```

#### Bước 3: Ứng viên mở cuộc trò chuyện
- Ứng viên nhấn vào cuộc trò chuyện để xem chi tiết
- Frontend gọi API lấy thông tin cuộc trò chuyện
- API: `GET /messages/conversations/{conversation-id}`
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin cuộc trò chuyện thành công",
  "data": {
    "_id": "conversation-id",
    "name": "Tuyển dụng vị trí Frontend Developer",
    "lastMessage": {
      "_id": "message-id",
      "textContent": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer.",
      "contentType": "text",
      "senderId": "id-của-nhà-tuyển-dụng",
      "createdAt": "2023-05-20T10:30:00.000Z"
    },
    "createdAt": "2023-05-20T10:30:00.000Z",
    "updatedAt": "2023-05-20T10:30:00.000Z",
    "participantsCount": 2,
    "unreadCount": 1
  }
}
```

#### Bước 4: Hiển thị tin nhắn trong cuộc trò chuyện
- Frontend gọi API lấy danh sách tin nhắn
- API: `GET /messages/conversations/{conversation-id}/messages?page=1&pageSize=20`
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách tin nhắn thành công",
  "data": {
    "meta": {
      "current": 1,
      "pageSize": 20,
      "pages": 1,
      "total": 1
    },
    "result": [
      {
        "_id": "message-id",
        "conversationId": "conversation-id",
        "senderId": "id-của-nhà-tuyển-dụng",
        "contentType": "text",
        "textContent": "Chào bạn, tôi là HR của công ty ABC. Tôi đã xem qua CV của bạn và muốn trao đổi thêm về vị trí Frontend Developer.",
        "isRead": false,
        "createdAt": "2023-05-20T10:30:00.000Z"
      }
    ]
  }
}
```

#### Bước 5: Đánh dấu tin nhắn đã đọc
- Khi ứng viên xem tin nhắn, frontend gọi API đánh dấu đã đọc
- API: `PATCH /messages/conversations/{conversation-id}/read`
- Dữ liệu gửi đi:
```json
{
  "messageId": "message-id"
}
```
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Đánh dấu tin nhắn đã đọc thành công",
  "data": {
    "success": true
  }
}
```

#### Bước 6: Thông báo cho nhà tuyển dụng
- WebSocket gửi thông báo đến nhà tuyển dụng
- Sự kiện: `message_read`
- Dữ liệu sự kiện:
```json
{
  "conversationId": "conversation-id",
  "messageId": "message-id",
  "userId": "id-của-ứng-viên"
}
```

### 3. Ứng viên trả lời tin nhắn

#### Bước 1: Ứng viên soạn tin nhắn và gửi
- Ứng viên nhập nội dung trả lời và nhấn nút gửi
- Frontend gọi API gửi tin nhắn
- API: `POST /messages/send`
- Dữ liệu gửi đi:
```json
{
  "conversationId": "conversation-id",
  "contentType": "text",
  "textContent": "Chào anh/chị, em rất vui khi nhận được tin nhắn. Em rất quan tâm đến vị trí này và sẵn sàng trao đổi thêm."
}
```
- Kết quả trả về:
```json
{
  "statusCode": 200,
  "message": "Gửi tin nhắn thành công",
  "data": {
    "_id": "message-id-2",
    "conversationId": "conversation-id",
    "senderId": "id-của-ứng-viên",
    "contentType": "text",
    "textContent": "Chào anh/chị, em rất vui khi nhận được tin nhắn. Em rất quan tâm đến vị trí này và sẵn sàng trao đổi thêm.",
    "createdAt": "2023-05-20T10:35:00.000Z"
  }
}
```

#### Bước 2: Thông báo cho nhà tuyển dụng
- WebSocket gửi thông báo đến nhà tuyển dụng về tin nhắn mới
- Sự kiện: `new_message`
- Dữ liệu sự kiện:
```json
{
  "conversationId": "conversation-id",
  "messageId": "message-id-2",
  "senderId": "id-của-ứng-viên",
  "content": "Chào anh/chị, em rất vui khi nhận được tin nhắn. Em rất quan tâm đến vị trí này và sẵn sàng trao đổi thêm.",
  "contentType": "text"
}
```

### 4. Nhà tuyển dụng trao đổi thông tin phỏng vấn

#### Bước 1: Nhà tuyển dụng xem tin nhắn và đánh dấu đã đọc
- Tương tự như bước 2.4 và 2.5, nhà tuyển dụng xem tin nhắn và hệ thống đánh dấu đã đọc

#### Bước 2: Nhà tuyển dụng gửi thông tin phỏng vấn
- Nhà tuyển dụng gửi tin nhắn với thông tin phỏng vấn
- API: `POST /messages/send`
- Dữ liệu gửi đi:
```json
{
  "conversationId": "conversation-id",
  "contentType": "text",
  "textContent": "Cảm ơn bạn đã phản hồi. Chúng tôi muốn mời bạn tham gia buổi phỏng vấn vào ngày 25/05/2023, lúc 9:00 sáng qua Google Meet. Link meeting: https://meet.google.com/abc-xyz-123. Vui lòng xác nhận bạn có thể tham gia được không?"
}
```
- Kết quả và thông báo tương tự như các bước trước

### 5. Cuộc trò chuyện tiếp tục

Quá trình trao đổi tin nhắn tiếp tục theo quy trình tương tự, bao gồm:
1. Nhập và gửi tin nhắn
2. Thông báo qua WebSocket
3. Hiển thị tin nhắn mới
4. Đánh dấu đã đọc
5. Thông báo trạng thái đã đọc

## Tóm tắt API sử dụng

### 1. Quản lý cuộc trò chuyện
- `POST /messages/conversation`: Tạo cuộc trò chuyện mới
- `GET /messages/conversations`: Lấy danh sách cuộc trò chuyện của người dùng
- `GET /messages/conversations/{id}`: Lấy thông tin chi tiết cuộc trò chuyện
- `PATCH /messages/conversations/{id}`: Cập nhật thông tin cuộc trò chuyện
- `DELETE /messages/conversations/{id}`: Xóa cuộc trò chuyện

### 2. Quản lý tin nhắn
- `GET /messages/conversations/{id}/messages`: Lấy danh sách tin nhắn trong cuộc trò chuyện
- `POST /messages/send`: Gửi tin nhắn mới
- `PATCH /messages/conversations/{id}/read`: Đánh dấu tin nhắn đã đọc

### 3. WebSocket Events
- `connection`: Kết nối người dùng với hệ thống WebSocket
- `disconnect`: Ngắt kết nối WebSocket
- `new_message`: Thông báo khi có tin nhắn mới
- `message_read`: Thông báo khi tin nhắn được đọc
- `typing`: Thông báo khi người dùng đang nhập tin nhắn

## Kết luận

Luồng giao tiếp tin nhắn giữa nhà tuyển dụng và ứng viên được thiết lập để đảm bảo trải nghiệm thời gian thực với việc cập nhật trạng thái tin nhắn. Các API được thiết kế theo tiêu chuẩn RESTful, kết hợp với WebSocket để cung cấp thông báo tức thì. Điều này tạo điều kiện thuận lợi cho việc trao đổi thông tin và giúp quá trình tuyển dụng diễn ra hiệu quả hơn. 