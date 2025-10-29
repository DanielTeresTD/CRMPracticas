import {
    Entity, PrimaryColumn
} from 'typeorm';

@Entity('lineas_paradas')
export class LineasParadas {
    @PrimaryColumn()
    codLinea!: number;

    @PrimaryColumn()
    codParada!: number;
}
