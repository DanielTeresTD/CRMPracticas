import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "horarios" })
export class Horarios {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column({ name: "codLinea", type: "smallint", unsigned: true })
    codLinea!: number;

    @Column({ name: "codParada", type: "smallint", unsigned: true })
    codParada!: number;

    // To determine when the next bus arrives at a stop, I will use the current time 
    // with new Date(), calculate the difference with this attribute, 
    // and keep the smallest possible time difference.
    @Column({ name: "tiempoLlegada", type: "time", nullable: true })
    tiempoLlegada!: string;
}
