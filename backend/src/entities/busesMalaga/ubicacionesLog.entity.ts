import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity({ name: "ubicaciones_log" })
export class UbicacionesLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "smallint", unsigned: true })
  codBus!: number;

  @Column({ type: "smallint", unsigned: true })
  codLinea!: number;

  @Column({ type: "tinyint" })
  sentido!: number;

  @Column({
    type: "decimal",
    precision: 9,
    scale: 6,
    nullable: true,
  })
  lat!: number;

  @Column({
    type: "decimal",
    precision: 9,
    scale: 6,
    nullable: true,
  })
  lon!: number;
}
