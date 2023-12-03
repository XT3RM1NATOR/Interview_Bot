import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class InterviewerSlot {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    interviewer_id!: number;

    @Column()
    start_time!: Date;

    @Column()
    end_time!: Date;
    
    @Column()
    interviewee_id?: number;

    @Column()
    chat_id?: number;
}
