import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "paradas" })
export class Paradas {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({
    name: "codParada",
    type: "smallint",
    unsigned: true,
    unique: true,
    nullable: false,
  })
  codParada!: number;

  @Column({ name: "nombreParada", type: "text", nullable: false })
  nombreParada!: string;

  @Column({ name: "direccion", type: "text", nullable: true })
  direccion!: string;

  @Column({
    name: "lat",
    type: "decimal",
    precision: 9,
    scale: 6,
    nullable: true,
  })
  lat!: number;

  @Column({
    name: "lon",
    type: "decimal",
    precision: 9,
    scale: 6,
    nullable: true,
  })
  lon!: number;

  @Column({ name: "orden", type: "smallint", unsigned: true })
  orden!: number;
}
