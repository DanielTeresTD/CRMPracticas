import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "typeorm";

@Entity({ name: "horarios" })
@Unique(["codLinea", "codParada"])
export class Horarios {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @PrimaryColumn({ name: "codLinea", type: "smallint", unsigned: true })
  codLinea!: number;

  @PrimaryColumn({ name: "codParada", type: "smallint", unsigned: true })
  codParada!: number;

  @Column({ name: "secParada", type: "smallint", unsigned: true })
  secParada!: number;

  @Column({ name: "sentido", type: "tinyint" })
  sentido!: number;
}
