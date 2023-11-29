import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatList } from "./ChatList.ts";
import { InterviewerSlot } from "./InterviewerSlot.ts";
import { User } from "./User.ts";

@Entity()
export class ScheduledInterview {
    @PrimaryGeneratedColumn()
    schedule_id: number

    @ManyToOne(() => User)
    interviewee: User;

    @ManyToOne(() => User)
    interviewer: User;

    @ManyToOne(() => InterviewerSlot)
    slot: InterviewerSlot;

    @ManyToOne(() => ChatList)
    chat: ChatList;

    @Column()
    scheduled_date: Date
}
