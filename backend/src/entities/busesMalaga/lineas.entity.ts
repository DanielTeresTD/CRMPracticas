import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "lineas" })
export class Lineas {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column({ name: "codLinea", type: "smallint", unique: true, nullable: false })
    codLinea!: number;

    @Column({ name: "nombreLinea", type: "text", nullable: false })
    nombreLinea!: string;

    @Column({ name: "cabeceraIda", type: "text", nullable: true })
    cabeceraIda!: string;

    @Column({ name: "cabeceraVuelta", type: "text", nullable: true })
    cabeceraVuelta!: string;
}