import csv from "csv-parser";
import { createReadStream } from "fs";
import { DB } from '../../config/typeorm';
import { DeepPartial } from "typeorm";
import { Horarios } from '../../entities/busesMalaga/horarios.entity';
import { LineasParadas } from "../../entities/busesMalaga/lineas_paradas.entity";
import { storeByChunks } from './busApi.service';
import path from "path";

export class HorariosService {
    private static readonly routeToCsvFiles = path.join(__dirname, "../../csvFiles/");

    public static async storeBusSchedule(): Promise<void> {
        const stopTimesColumns = ["trip_id", "arrival_time", "stop_id"];
        const stopTimesData = await this.readAndParseCSV(
            path.join(this.routeToCsvFiles, "stop_times.csv"),
            stopTimesColumns
        );

        const tripsDataColumns = ["trip_id", "route_id"];
        const tripsData = await this.readAndParseCSV(
            path.join(this.routeToCsvFiles, "trips.csv"),
            tripsDataColumns
        );

        // Join trip id and route id
        const tripIdToRouteId = new Map(
            tripsData.map(trip => [(trip as any).trip_id, (trip as any).route_id])
        );

        const horariosToInsert: DeepPartial<Horarios>[] = [];

        // Generate time arrivals for each line and bus stop
        for (const stop of stopTimesData) {
            const stopAny = stop as any;
            const routeId = tripIdToRouteId.get(stopAny.trip_id);
            if (!routeId) continue;

            horariosToInsert.push({
                codLinea: Number(routeId),
                codParada: Number(stopAny.stop_id),
                tiempoLlegada: stopAny.arrival_time
            });
        }

        const constraints = ["codLinea", "codParada", "tiempoLlegada"];
        const chunkSize = 10_000;
        await storeByChunks(
            DB.getRepository(Horarios),
            horariosToInsert,
            constraints,
            chunkSize
        );
    }

    private static async readAndParseCSV(csvPath: string, columnNames: Array<string>): Promise<Array<Object>> {
        const results: Array<Object> = [];
        return new Promise((resolve, reject) => {
            createReadStream(csvPath)
                .pipe(csv())
                .on("data", (data: any) => {
                    const filteredData: { [key: string]: any } = {};
                    for (const key of columnNames) {
                        if (data.hasOwnProperty(key)) {
                            filteredData[key] = data[key];
                        }
                    }
                    if (Object.keys(filteredData).length > 0) {
                        results.push(filteredData);
                    }
                })
                .on("end", () => {
                    const fileName = path.basename(csvPath);
                    console.log(`Parsed successfully ${fileName}`);
                    resolve(results);
                })
                .on("error", (err: any) => reject(err));
        });
    }
}
