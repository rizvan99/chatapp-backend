import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import Client from './client.entity';
import { ChatClient } from '../../../core/models/chat-client.model';

@Entity()
class Message {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public message: string;

  @OneToOne(() => Client, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  public sender: Client;
}

export default Message;
