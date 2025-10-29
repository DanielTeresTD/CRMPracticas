import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "horarios" })
export class Horarios {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

}
