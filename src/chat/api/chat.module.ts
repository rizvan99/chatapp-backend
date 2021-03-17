import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from '../core/services/chat.service';
import { IChatServiceProvider } from '../core/primary-ports/chat.service.interface';
import Client from '../infrastructure/data-source/entities/client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from '../infrastructure/data-source/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Message])],
  providers: [
    ChatGateway,
    { provide: IChatServiceProvider, useClass: ChatService },
  ],
})
export class ChatModule {}
