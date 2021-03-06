import { Injectable } from '@nestjs/common';
import { ChatClient } from '../models/chat-client.model';
import { ChatMessage } from '../models/chat-message.model';
import { IChatService } from '../primary-ports/chat.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import Client from '../../infrastructure/data-source/entities/client.entity';
import { Repository } from 'typeorm';
import Message from '../../infrastructure/data-source/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService implements IChatService {
  //allMessages: ChatMessage[] = [];
  //clients: ChatClient[] = [];

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
    const messages = await this.messageRepository.find({
      relations: ['sender'],
    });
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
    return { message: dbMessage.message, sender: messageSender };
  }

  async newClient(chatClient: ChatClient): Promise<ChatClient> {
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

    const chatClientFoundById = await this.clientRepository.findOne({id: chatClient.id});
    if(chatClientFoundById) {
      return JSON.parse(JSON.stringify(chatClientFoundById));
    }
    const chatClientFoundByNickname = await this.clientRepository.findOne({
      nickname: chatClient.nickname,
    });
    if (chatClientFoundByNickname) {
      throw new Error('Nickname already used!');
    }
    let client = this.clientRepository.create();
    client.nickname = chatClient.nickname;
    client = await this.clientRepository.save(client);
    const newChatClient = JSON.parse(JSON.stringify(client));
    return newChatClient;
  }

  async delete(id: string): Promise<void> {
    await this.clientRepository.delete({ id: id });
  }

  async updateTyping(isTyping: boolean, id: string): Promise<ChatClient> {
    const chatClient = await this.clientRepository.findOne(id);
    const client: ChatClient = JSON.parse(JSON.stringify(chatClient));
    if (client && client.isTyping !== isTyping) {
      client.isTyping = isTyping;
      return client;
    }
  }
}
