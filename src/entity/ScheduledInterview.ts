import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatList } from "./ChatList";
import { InterviewerSlot } from "./InterviewerSlot";
import { User } from "./User";

@Entity()
export class ScheduledInterview {
    @PrimaryGeneratedColumn()
    schedule_id!: number

    @ManyToOne(() => User)
    interviewee!: User;

    @ManyToOne(() => User)
    interviewer!: User;

    @ManyToOne(() => InterviewerSlot)
    slot!: InterviewerSlot;

    @ManyToOne(() => ChatList)
    chat!: ChatList;

    @Column()
    scheduled_date!: Date
}
