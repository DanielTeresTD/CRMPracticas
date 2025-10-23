import {
    Entity, Column, PrimaryGeneratedColumn,
    ManyToOne, OneToOne, JoinColumn,
    OneToMany
} from 'typeorm';

import { Role } from './role.entity';
import { Client } from './client.entity';
import { Log } from './log.entity';

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column({ type: "varchar", length: 30, name: "userName", unique: true })
    userName!: string;

    @Column({ type: "varchar", length: 64, name: "password" })
    password!: string;

    @ManyToOne(() => Role, (userRole) => userRole.user)
    @JoinColumn({ name: "roleId" })
    role!: Role;

    @OneToOne(() => Client, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: "dni", referencedColumnName: "dni" })
    client!: Client;

    @OneToMany(() => Log, (log) => log.userId)
    log!: Log[];
}
