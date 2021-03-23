import {
  Column,
  Entity,
  JoinColumn, ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Client from './client.entity';
import { ChatClient } from '../../../core/models/chat-client.model';

@Entity()
class Message {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public message: string;

  @ManyToOne(() => Client, (client: Client) => client.messages)
  public sender: Client;
}

export default Message;
