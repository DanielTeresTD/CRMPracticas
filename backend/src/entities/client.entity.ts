import {
    Entity, Column, PrimaryGeneratedColumn,
    OneToMany, OneToOne, JoinColumn
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

    @Column("text", { name: "email", nullable: true })
    email!: string;

    @Column({ type: "varchar", length: 9, name: "dni", unique: true })
    dni!: string;

    // cascade --> Tells orm if there are Phones on Client Object, and Client is saved,
    //             the new Phones should also be saved 
    @OneToMany(() => ClientPhones, (clientPhone) => clientPhone.client, {
        cascade: true
    })
    phoneNums!: ClientPhones[];
}