import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: "ubicaciones" })
@Unique(["codBus", "codLinea"])
export class Ubicacionnes {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @Column({ name: "codBus", type: "smallint" })
    codBus!: number;

    @Column({ name: "codLinea", type: "smallint" })
    codLinea!: number;

    @Column({ name: "sentido", type: "tinyint" })
    sentido!: number;

    @Column({ name: "lat", type: "decimal", precision: 9, scale: 6, nullable: true })
    lat!: number;

    @Column({ name: "lon", type: "decimal", precision: 9, scale: 6, nullable: true })
    lon!: number;
}

