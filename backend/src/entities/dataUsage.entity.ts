import {
    Entity, Column, PrimaryGeneratedColumn,
    ManyToOne, JoinColumn, Index
} from "typeorm";

import { ClientPhones } from "./phone.entity";

@Entity({ name: "data_usage" })
@Index(["month", "year", "phone"], { unique: true })
export class DataUsage {
    @PrimaryGeneratedColumn({ name: "idRow" })
    idRow!: number;

    @Column({ name: "month", type: "tinyint", unsigned: true, nullable: true })
    month!: number;

    @Column({ name: "year", type: "smallint", unsigned: true, nullable: true })
    year!: number;

    @Column({ name: "dataUsage", type: "decimal", precision: 8, scale: 2, nullable: true })
    dataUsage!: number | null;

    @ManyToOne(() => ClientPhones, (phone) => phone.dataUsages, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "phoneID" })
    phone!: ClientPhones;
}