import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ConversationParticipantSchema } from './schemas/conversation-participant.schema';
import { ConversationSchema } from './schemas/conversation.schema';
import { Conversation } from './schemas/conversation.schema';
import { MessageSchema } from './schemas/message.schema';
import { Message } from './schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationParticipant } from './schemas/conversation-participant.schema';
import { WebsocketsModule } from '../websockets/websockets.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: ConversationParticipant.name, schema: ConversationParticipantSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WebsocketsModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService]
})
export class MessagesModule {}
