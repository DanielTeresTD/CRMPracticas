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

    @Column({ name: "lat", type: "decimal", precision: 9, scale: 6, nullable: true })
    lat!: number;

    @Column({ name: "lon", type: "decimal", precision: 9, scale: 6, nullable: true })
    lon!: number;
}

