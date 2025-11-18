import { DeepPartial, Repository } from "typeorm";
import { DB } from "../../config/typeorm";
import { Ubicaciones } from "../../entities/busesMalaga/ubicaciones.entity";
import { UbicacionesLog } from "../../entities/busesMalaga/ubicacionesLog.entity";
import { fetchBusApiData, storeByChunks } from "./busApi.service";

export class UbicacionesService {
  private static readonly busLocationsRepo = DB.getRepository(Ubicaciones);
  private static readonly busLocationsLogsRepo =
    DB.getRepository(UbicacionesLog);

  public static async storeLocations(): Promise<DeepPartial<Ubicaciones>[]> {
    const limit = 200;
    const data = await fetchBusApiData(
      process.env.API_BUS_LOCATIONS!,
      process.env.RESOURCE_ID_BUS_LOCATIONS!,
      limit
    );

    const rawRecords: any[] = data.result.records;
    const locationsParsed: DeepPartial<Ubicaciones>[] = rawRecords.map(
      (actLine) => ({
        codBus: actLine.codBus,
        codLinea: actLine.codLinea,
        sentido: actLine.sentido,
        lat: actLine.lat,
        lon: actLine.lon,
      })
    );

    const chunkSize = 1024;
    const constraints = ["codBus", "codLinea"];
    await storeByChunks(
      this.busLocationsRepo,
      locationsParsed,
      constraints,
      chunkSize
    );
    // Store logs bus locations
    await this.busLocationsLogsRepo.save(locationsParsed, { chunk: chunkSize });
    return locationsParsed;
  }

  public static async getLocationsByLineId(
    lineId: number
  ): Promise<Ubicaciones[]> {
    return await this.busLocationsRepo.findBy({ codLinea: lineId });
  }

  public static async getLocationsBuses(): Promise<Ubicaciones[]> {
    return await this.busLocationsRepo.find();
  }

  public static async getBusLocationsLog(
    busId: number
  ): Promise<UbicacionesLog[]> {
    return await this.busLocationsLogsRepo.findBy({ codBus: busId });
  }
}
