import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WelcomeDto } from '../dto/welcome.dto';
import { Inject } from '@nestjs/common';
import {
  IChatService,
  IChatServiceProvider,
} from '../../core/primary-ports/chat.service.interface';
import { JoinChatDto } from '../dto/join-chat.dto';
import { ChatClient } from '../../core/models/chat-client.model';
import { ChatMessage } from '../../core/models/chat-message.model';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(IChatServiceProvider) private chatService: IChatService,
  ) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleChatEvent(
    @MessageBody() msg: ChatMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const messageSend = await this.chatService.newMessage(
      msg.message,
      msg.sender.id,
    );
    this.server.emit('newMessage', messageSend);
  }

  @SubscribeMessage('typing')
  async handleTypingEvent(
    @MessageBody() isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('typing', isTyping);
    const chatClient = await this.chatService.updateTyping(isTyping, client.id);
    if (chatClient) {
      this.server.emit('clientTyping', chatClient);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChatEvent(
    @MessageBody() joinChatDto: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      let newClient: ChatClient = JSON.parse(JSON.stringify(joinChatDto));
      newClient = await this.chatService.newClient(newClient);
      const chatClients = await this.chatService.getClients();
      const welcome: WelcomeDto = {
        clients: chatClients,
        messages: await this.chatService.getMessages(),
        client: newClient,
      };
      client.emit('welcome', welcome);
      this.server.emit('clients', chatClients);
    } catch (e) {
      //this.server.emit('chat-error', e.message);x½
      client.error(e.message);
      console.log(e.message);
    }
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<any> {
    console.log('Client Connect', client.id);
    client.emit('allMessages', await this.chatService.getMessages());
    this.server.emit('clients', await this.chatService.getClients());
  }

  async handleDisconnect(client: Socket): Promise<any> {
    console.log('Client Disconnect', client.id);
    await this.chatService.delete(client.id);
    this.server.emit('clients', await this.chatService.getClients());
  }
}
