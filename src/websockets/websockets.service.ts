import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateWebsocketDto } from './dto/create-websocket.dto';

@Injectable()
export class WebsocketsService {
  private userSockets = new Map<string, Set<Socket>>();

  // Quản lý kết nối socket
  handleUserConnection(userId: string, socket: Socket) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket);
    return true;
  }

  // Xử lý ngắt kết nối
  handleUserDisconnection(userId: string, socket: Socket) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
      return true;
    }
    return false;
  }

  // Gửi thông báo đến một người dùng cụ thể
  sendNotificationToUser(createWebsocketDto: CreateWebsocketDto): boolean {
    const userSocketSet = this.userSockets.get(createWebsocketDto.userId);
    if (!userSocketSet) {
      return false;
    }

    userSocketSet.forEach(socket => {
      socket.emit(createWebsocketDto.event, createWebsocketDto.message);
    });
    return true;
  }

  // Kiểm tra trạng thái kết nối của người dùng
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  // Lấy số lượng kết nối của một người dùng
  getUserConnectionCount(userId: string): number {
    const userSocketSet = this.userSockets.get(userId);
    return userSocketSet ? userSocketSet.size : 0;
  }

  // Lấy danh sách tất cả người dùng đang kết nối
  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}
