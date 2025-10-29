import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LineasParadas } from './lineas_paradas.entity';

@Entity({ name: "horarios" })
export class Horarios {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @ManyToOne(() => LineasParadas)
    @JoinColumn([
        { name: 'codLinea', referencedColumnName: 'codLinea' },
        { name: 'codParada', referencedColumnName: 'codParada' }
    ])
    lineaParada!: LineasParadas;

    // To determine when the next bus arrives at a stop, I will use the current time 
    // with new Date(), calculate the difference with this attribute, 
    // and keep the smallest possible time difference.
    @Column({ name: "tiempoLlegada", type: "time", nullable: true })
    tiempoLlegada!: string;
}
