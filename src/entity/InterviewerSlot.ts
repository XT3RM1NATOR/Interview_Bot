import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatList } from "./ChatList";
import { User } from "./User";

@Entity()
export class InterviewerSlot {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => ChatList)
    chat!: ChatList;

    @Column()
    day_of_week!: string

    @Column()
    start_time!: string

    @Column()
    end_time!: string
}
