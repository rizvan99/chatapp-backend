import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import Message from './message.entity';

@Entity()
class Client {
  @PrimaryColumn({ unique: true })
  public id: string;

  @Column({ unique: true })
  public nickname: string;

  @OneToMany(() => Message, (message: Message) => message.sender)
  public messages?: Message[];
}

export default Client;
