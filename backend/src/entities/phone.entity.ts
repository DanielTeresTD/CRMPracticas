
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";

import { Client } from "./client.entity";
import { DataUsage } from './dataUsage.entity';

@Entity({ name: "client_phones" })
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

    @OneToMany(() => DataUsage, (usage) => usage.phone, {
        cascade: true
    })
    dataUsages!: DataUsage[];
}