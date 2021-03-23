import { ChatMessage } from '../models/chat-message.model';
import { ChatClient } from '../models/chat-client.model';
import { Observable } from 'rxjs';
import Client from '../../infrastructure/data-source/entities/client.entity';
import Message from '../../infrastructure/data-source/entities/message.entity';

export const IChatServiceProvider = 'IChatServiceProvider';

export interface IChatService {
  getClients(): Promise<ChatClient[]>;

  getMessages(): Promise<ChatMessage[]>;

  newMessage(message: string, sender: string): Promise<ChatMessage>;

  newClient(id: string, nickname: string): Promise<ChatClient>;

  delete(id: string): Promise<void>;

  updateTyping(isTyping: boolean, id: string): Promise<ChatClient>
}
