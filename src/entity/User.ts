import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    role!: string;

    @Column()
    chat_id!: number;

    @Column()
    timezone_hour?: number;

    @Column()
    timezone_minute?: number;

    @Column()
    approved?:boolean;

    @Column()
    description?: string;

    @Column()
    tg_chat_id!: number;
}