import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import Client from '../../infrastructure/data-source/entities/client.entity';
import { Repository } from 'typeorm';
import Message from '../../infrastructure/data-source/entities/message.entity';

@Injectable()
export class ChatService implements IChatService {
  allMessages: ChatMessage[] = [];
  clients: ChatClient[] = [];

  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  async getClients(): Promise<ChatClient[]> {
    const clients = await this.clientRepository.find();
    const chatClients: ChatClient[] = JSON.parse(JSON.stringify(clients));
    return chatClients;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.find();
    const chatMessages: ChatMessage[] = JSON.parse(JSON.stringify(messages));
    return chatMessages;
  }

  async newMessage(message: string, sender: string): Promise<ChatMessage> {
    /*const chatMessage: ChatMessage = {
      sender: this.clients.find((c) => c.id === sender),
      message: message,
    };
    this.allMessages.push(chatMessage);
    return chatMessage;*/

    const messageSender = await this.clientRepository.findOne(sender);
    const dbMessage = {
      sender: messageSender,
      message: message,
    };
    const newMessage = await this.messageRepository.create(dbMessage);
    await this.messageRepository.save(newMessage);
    return { message: dbMessage.sender + '', sender: messageSender };
  }

  async newClient(id: string, nickname: string): Promise<ChatClient> {
    /*
    const chatClient = this.clients.find(
      (c) => c.nickname === nickname && c.id === id,
    );
    if (chatClient) {
      return chatClient;
    }
    if (this.clients.find((c) => c.nickname === nickname)) {
      throw new Error('Nickname is already taken');
    } */
    //chatClient = { id: id, nickname: nickname };
    //this.clients.push(chatClient);
    const dbClient = await this.clientRepository.findOne({
      nickname: nickname,
    });

    if (!dbClient) {
      let client = this.clientRepository.create();
      client.nickname = nickname;
      client.id = id;
      client = await this.clientRepository.save(client);
      return { id: client.id + '', nickname: client.nickname };
    }
    if (dbClient.id === id) {
      return { id: dbClient.id, nickname: dbClient.nickname };
    } else {
      throw new Error('Nickname is already taken');
    }
  }

  async delete(id: string): Promise<void> {
    await this.clientRepository.delete({ id: id });
  }

  updateTyping(isTyping: boolean, id: string): ChatClient {
    const chatClient = this.clients.find((c) => c.id === id);
    if (chatClient && chatClient.isTyping !== isTyping) {
      chatClient.isTyping = isTyping;
      return chatClient;
    }
  }
}
