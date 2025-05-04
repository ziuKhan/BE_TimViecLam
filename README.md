# Dự án Tìm Việc Làm - Backend NestJS

## Giới thiệu

Đây là một dự án backend sử dụng NestJS, một framework mạnh mẽ cho Node.js. Dự án này cung cấp các API để quản lý trang web tìm việc làm với công việc, người dùng, công ty, và nhiều tính năng khác.

🔗 [Link đến repository frontend](https://github.com/ndkag/DA4_VueJS_TimViecLam.git)

🚧 **Dự án đang trong quá trình phát triển** 🚧

Dự án này vẫn đang được hoàn thiện. Tôi đang tích cực làm việc để cải thiện và bổ sung thêm tính năng. Mọi người hãy theo dõi repository này để cập nhật những thay đổi mới nhất. Tôi rất hoan nghênh mọi đóng góp và phản hồi từ cộng đồng!

## Tính năng chính

- Xác thực và phân quyền người dùng
- Quản lý công việc và hồ sơ ứng viên
- Quản lý công ty và người dùng
- Hệ thống phân quyền linh hoạt
- Tích hợp với Google OAuth
- Gửi email tự động
- Upload file
- API được bảo vệ bởi JWT

## Công nghệ sử dụng

- NestJS
- MongoDB với Mongoose
- Passport.js cho xác thực
- JWT cho bảo mật API
- Nodemailer cho gửi email
- Swagger cho tài liệu API

## Cài đặt

1. Clone repository:
   ```
   git clone https://github.com/ndkag/DA4_NestJS_TimViecLam.git
   ```

2. Di chuyển vào thư mục dự án:
   ```
   cd <tên thư mục dự án>
   ```

3. Cài đặt các dependencies:
   ```
   npm install
   ```

4. Tạo file .env và cấu hình các biến môi trường cần thiết (xem phần Cấu hình).

5. Khởi chạy ứng dụng:
   ```
   npm run dev
   ```

## Cấu hình

Tạo file .env trong thư mục gốc của dự án và cấu hình các biến môi trường sau:

- PORT=3000
- MONGODB_URI=<URI kết nối MongoDB của bạn>
- JWT_SECRET=<Khóa bí mật cho JWT>
- GOOGLE_CLIENT_ID=<ID ứng dụng Google OAuth>
- GOOGLE_CLIENT_SECRET=<Secret ứng dụng Google OAuth>

## API Documentation

Sau khi khởi chạy ứng dụng, bạn có thể truy cập tài liệu API Swagger tại:
http://localhost:3000/api

## Cấu trúc dự án

Dự án được tổ chức thành các module chính:

- `auth`: Xử lý xác thực và phân quyền
- `users`: Quản lý người dùng
- `companies`: Quản lý thông tin công ty
- `jobs`: Quản lý công việc
- `resumes`: Quản lý hồ sơ ứng viên
- `permissions`: Quản lý quyền hạn
- `roles`: Quản lý vai trò người dùng
- `subscribers`: Quản lý người đăng ký nhận thông báo
- `files`: Xử lý upload file

## Tác giả

Nguyễn Duy Khang - duykhang02vnn@gmail.com

nest g resource transactions --no-spec

