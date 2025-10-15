import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    ManyToOne, JoinColumn
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: "log" })
export class Log {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @CreateDateColumn()
    currDate!: string;

    @Column({ name: "success", type: "boolean" })
    success!: boolean;

    @ManyToOne(() => User, (user) => user.log)
    @JoinColumn({ name: "userId" })
    userId!: User;
}
