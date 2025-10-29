import {
    Entity, PrimaryColumn
} from 'typeorm';

@Entity('lineas_paradas')
export class LineasParadas {
    @PrimaryColumn({ name: "codLinea", type: "smallint", unsigned: true })
    codLinea!: number;

    @PrimaryColumn({ name: "codParada", type: "smallint", unsigned: true })
    codParada!: number;
}
