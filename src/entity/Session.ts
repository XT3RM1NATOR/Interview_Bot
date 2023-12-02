import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  role!: string;

  @Column()
  stageId!: number;

  @Column({ type: 'varchar', length: 5 })
  timezone!: string;

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column()
  interviewer!: boolean;

  @Column()
  chat_id!: number;
}
