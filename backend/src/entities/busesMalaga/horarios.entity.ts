import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "typeorm";

@Entity({ name: "horarios" })
@Unique(["codLinea", "codParada", "tiempoLlegada"])
export class Horarios {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @PrimaryColumn({ name: "codLinea", type: "smallint", unsigned: true })
  codLinea!: number;

  @PrimaryColumn({ name: "codParada", type: "smallint", unsigned: true })
  codParada!: number;

  // To determine when the next bus arrives at a stop, I will use the current time
  // with new Date(), calculate the difference with this attribute,
  // and keep the smallest possible time difference.
  @Column({ name: "tiempoLlegada", type: "time", nullable: true })
  tiempoLlegada!: string;

  @Column({ name: "secParada", type: "smallint", unsigned: true })
  secParada!: number;
}
