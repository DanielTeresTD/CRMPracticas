import { DeepPartial, Repository } from "typeorm";
import { DB } from "../../config/typeorm";
import { Ubicacionnes } from "../../entities/busesMalaga/ubicaciones.entity";
import { fetchBusApiData, storeByChunks } from "./busApi.service";

export class UbicacionesService {
  private static readonly locationsRepo = DB.getRepository(Ubicacionnes);

  public static async storeLocations(): Promise<DeepPartial<Ubicacionnes>[]> {
    const limit = 200;
    const data = await fetchBusApiData(
      process.env.API_BUS_LOCATIONS!,
      process.env.RESOURCE_ID_BUS_LOCATIONS!,
      limit
    );

    const rawRecords: any[] = data.result.records;
    const locationsParsed: DeepPartial<Ubicacionnes>[] = rawRecords.map(
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
      this.locationsRepo,
      locationsParsed,
      constraints,
      chunkSize
    );
    return locationsParsed;
  }

  public static async getLocationsByLineId(
    lineId: number
  ): Promise<Ubicacionnes[]> {
    return this.locationsRepo.findBy({ codLinea: lineId });
  }
}
