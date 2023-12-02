import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  role!: string;

  @Column()
  stageId!: number;

  @Column()
  timezone_hour?: number

  @Column()
  timezone_minute?: number

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column()
  interviewer!: boolean;

  @Column()
  chat_id!: number;
}
