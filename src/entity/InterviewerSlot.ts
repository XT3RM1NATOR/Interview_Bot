import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class InterviewerSlot {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_id!: number;

    @Column() 
    day_of_week!: string

    @Column()
    start_time!: string

    @Column()
    end_time!: string
}
