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
    timezone?: string

    @Column()
    approved?:boolean

    @Column()
    chat_id!: number

    @Column()
    description?: string
}