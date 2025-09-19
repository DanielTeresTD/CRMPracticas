
import {
    Column, Entity, PrimaryColumn,
    PrimaryGeneratedColumn, CreateDateColumn,
    ManyToMany,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { Client } from "./client.entity";

@Entity()
export class ClientPhones {
    @Column({
        name: "PhoneNum",
        length: 15,
    })
    phoneNumber!: string;

    @PrimaryGeneratedColumn()
    phoneID!: number;

    @CreateDateColumn({ nullable: true })
    currDate!: string;

    @ManyToOne(() => Client, (client) => client.phoneNums, {
        nullable: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "ClientID" })
    client!: Client;
}