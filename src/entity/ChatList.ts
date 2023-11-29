import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatList {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    chat_name!: string
}
