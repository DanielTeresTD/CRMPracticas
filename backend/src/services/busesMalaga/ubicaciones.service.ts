import { DeepPartial, Repository } from "typeorm";
import { DB } from "../../config/typeorm";
import { Ubicaciones } from "../../entities/busesMalaga/ubicaciones.entity";
import { UbicacionesLog } from "../../entities/busesMalaga/ubicacionesLog.entity";
import { fetchBusApiData, storeByChunks } from "./busApi.service";

export class UbicacionesService {
  private static readonly busLocationsRepo = DB.getRepository(Ubicaciones);
  private static readonly busLocationsLogsRepo =
    DB.getRepository(UbicacionesLog);

  /**
   * fetch bus locations from external API and store them in database
   * also stores logs of locations
   * returns parsed locations
   */
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

    // store logs of bus locations
    await this.busLocationsLogsRepo.save(locationsParsed, { chunk: chunkSize });
    return locationsParsed;
  }

  /**
   * get bus locations filtered by line id
   * @param lineId - line id to filter buses
   */
  public static async getLocationsByLineId(
    lineId: number
  ): Promise<Ubicaciones[]> {
    return await this.busLocationsRepo.findBy({ codLinea: lineId });
  }

  /**
   * get all current bus locations
   */
  public static async getLocationsBuses(): Promise<Ubicaciones[]> {
    return await this.busLocationsRepo.find();
  }

  /**
   * get historical location logs of a specific bus
   * @param busId - bus id to fetch logs
   */
  public static async getBusLocationsLog(
    busId: number
  ): Promise<UbicacionesLog[]> {
    return await this.busLocationsLogsRepo.findBy({ codBus: busId });
  }
}
