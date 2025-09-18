import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    name!: string;
    @Column("text")
    address!: string;
}