import {
    Column, Entity, PrimaryColumn,
    PrimaryGeneratedColumn, CreateDateColumn
} from "typeorm";

@Entity()
export class ClientPhones {
    @PrimaryColumn({
        length: 15,
    })
    phoneNumber!: string;
    @Column()
    clientID!: number;
    @PrimaryGeneratedColumn()
    phoneID!: number;
    @CreateDateColumn()
    currDate!: string;
}