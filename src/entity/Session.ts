import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  role!: string;

  @Column()
  adminStage!: boolean;

  @Column({ type: 'varchar', length: 5 })
  timezone!: string;

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column()
  gmtStage!: boolean;

  @Column()
  descriptionStage!: boolean;

  @Column()
  interviewer!: boolean;

  @Column()
  newDescriptionStage!: boolean;

  @Column()
  chat_id!: number;
}
