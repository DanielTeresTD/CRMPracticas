import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "ubicaciones" })
export class Ubicacionnes {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column({ name: "codBus", type: "smallint", unique: true })
    codBus!: number;

    @Column({ name: "smallint", type: "text" })
    codLinea!: number;

    @Column({ name: "sentido", type: "tinyint" })
    sentido!: number;

    @Column({ name: "lon", type: "numeric" })
    lon!: number;

    @Column({ name: "lat", type: "numeric" })
    lat!: number;
}

