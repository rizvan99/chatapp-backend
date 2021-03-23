import { ChatMessage } from './chat-message.model';

export interface ChatClient {
  id: string;
  nickname: string;
  messages?: ChatMessage[];
  isTyping?: boolean;
}
