import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    username!: string

    @Column()
    role!: string

    @Column()
    chat_id!: number

    @Column()
    timezone?: string

    @Column()
    approved?:boolean

    @Column()
    description?: string
}