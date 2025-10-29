import {
    Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, OneToMany,
    ManyToMany, JoinTable
} from 'typeorm';
import { Paradas } from './paradas.entity';

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

    // @ManyToMany(() => Paradas, parada => parada.lineas)
    // // Necesaria tabla intermedia por las 2 relaciones ManyToMany
    // @JoinTable({
    //     name: "lineas_paradas",
    //     // Nombre de esta entidad con la que se relacionará
    //     joinColumn: {
    //         name: "codLinea"
    //     },
    //     // Nombre de la columna de la entidad con la que se relaciona
    //     inverseJoinColumn: {
    //         name: "codParada"
    //     }
    // })
    // paradas!: Paradas[];
}