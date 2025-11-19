import csv from "csv-parser";
import { createReadStream } from "fs";
import { DB } from "../../config/typeorm";
import { DeepPartial } from "typeorm";
import { Horarios } from "../../entities/busesMalaga/horarios.entity";
import { storeByChunks } from "./busApi.service";
import path from "path";

export class HorariosService {
  private static readonly routeToCsvFiles = path.join(
    __dirname,
    "../../csvFiles/"
  );
  private static readonly scheduleRepo = DB.getRepository(Horarios);

  /**
   * Reads CSV files and stores bus schedules in the database
   * It combines stop_times.csv and trips.csv to generate arrival sequences
   */
  public static async storeBusSchedule(): Promise<void> {
    const stopTimesColumns = [
      "trip_id",
      "arrival_time",
      "stop_id",
      "stop_sequence",
    ];
    const stopTimesData = await this.readAndParseCSV(
      path.join(this.routeToCsvFiles, "stop_times.csv"),
      stopTimesColumns
    );

    const tripsDataColumns = ["trip_id", "route_id", "direction_id"];
    const tripsData = await this.readAndParseCSV(
      path.join(this.routeToCsvFiles, "trips.csv"),
      tripsDataColumns
    );

    // Join trip_id → route_id
    const tripIdToRouteId = new Map(
      tripsData.map((trip) => [(trip as any).trip_id, (trip as any).route_id])
    );

    // Join trip_id → direction_id
    const tripIdToDirectionId = new Map(
      tripsData.map((trip) => [
        (trip as any).trip_id,
        (trip as any).direction_id,
      ])
    );

    const horariosToInsert: DeepPartial<Horarios>[] = [];

    // Generate schedule records
    for (const stop of stopTimesData) {
      const stopAny = stop as any;
      const routeId = tripIdToRouteId.get(stopAny.trip_id);
      const directionId = tripIdToDirectionId.get(stopAny.trip_id);

      if (!routeId || directionId === undefined) continue;

      horariosToInsert.push({
        codLinea: Number(routeId),
        codParada: Number(stopAny.stop_id),
        secParada: Number(stopAny.stop_sequence),
        sentido: Number(directionId) + 1,
      });
    }

    const constraints = ["codLinea", "codParada"];
    const chunkSize = 10_000;
    await storeByChunks(
      this.scheduleRepo,
      horariosToInsert,
      constraints,
      chunkSize
    );
  }

  /**
   * Reads a CSV file and returns an array of objects filtered by specified columns
   * @param csvPath - full path to the CSV file
   * @param columnNames - list of column names to include in the result
   */
  private static async readAndParseCSV(
    csvPath: string,
    columnNames: Array<string>
  ): Promise<Array<Object>> {
    const results: Array<Object> = [];
    return new Promise((resolve, reject) => {
      createReadStream(csvPath)
        .pipe(csv())
        .on("data", (data: any) => {
          const filteredData: { [key: string]: any } = {};
          for (const key of columnNames) {
            filteredData[key] = data[key];
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

  /**
   * Returns all bus stops for a given line ordered by direction and sequence
   * @param lineId - bus line ID
   */
  public static async getOrderedBusStops(
    lineId: number
  ): Promise<DeepPartial<Horarios>[]> {
    return await this.scheduleRepo.find({
      where: { codLinea: lineId },
      order: {
        sentido: "ASC",
        secParada: "ASC",
      },
    });
  }
}
