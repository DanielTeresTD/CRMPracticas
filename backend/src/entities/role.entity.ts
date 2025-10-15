import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { User } from './user.entity';

@Entity({ name: "role" })
export class Role {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column("text", { name: "type" })
    type!: string;

    @OneToMany(() => User, (user) => user.rol)
    user!: User[];
}
