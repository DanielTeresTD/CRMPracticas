import {
    Entity, Column, PrimaryColumn, PrimaryGeneratedColumn,
    OneToMany, JoinColumn
} from "typeorm";

import { ClientPhones } from "./phone.entity";

@Entity({ name: "client" })
export class Client {
    @PrimaryGeneratedColumn({ name: "ID" })
    id!: number;
    @Column({ name: "NameClient" })
    name!: string;
    @Column("text", { name: "Direction", nullable: true })
    address!: string;

    @OneToMany(() => ClientPhones, (clientPhone) => clientPhone.client)
    phoneNums!: ClientPhones[];
}