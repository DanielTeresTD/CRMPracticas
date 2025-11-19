import { DB } from "../../config/typeorm";
import { Paradas } from "../../entities/busesMalaga/paradas.entity";
import { LineasParadas } from "../../entities/busesMalaga/lineas_paradas.entity";
import { DeepPartial, Repository, In } from "typeorm";

export class ParadasService {
  private static readonly busStopsRepo = DB.getRepository(Paradas);
  private static readonly linesStopsRepo = DB.getRepository(LineasParadas);

  /**
   * add bus stops from raw API data
   * filters out invalid records and stores in database in chunks
   * @param rawRecords - raw data from API
   */
  public static async addBusStops(rawRecords: any[]): Promise<void> {
    const busStopsRepository = DB.getRepository(Paradas);

    // filter invalid records and create array of stops
    const busStops = rawRecords
      .filter((item) => item.codParada != null && item.nombreParada != null)
      .map((item) => ({
        codParada: item.codParada,
        nombreParada: item.nombreParada,
        direccion: item.direccion,
        lat: item.lat,
        lon: item.lon,
        orden: item.orden,
      }));

    const chunkSize = 1024;
    await this.storeBusStopsByChunks(busStopsRepository, busStops, chunkSize);
  }

  /**
   * store bus stops in database by chunks to avoid large inserts
   * @param busStopsRepository - repository to insert into
   * @param busStops - array of bus stops to store
   * @param chunkSize - size of each chunk
   */
  private static async storeBusStopsByChunks(
    busStopsRepository: Repository<Paradas>,
    busStops: Array<DeepPartial<Paradas>>,
    chunkSize: number
  ): Promise<void> {
    for (let i = 0; i < busStops.length; i += chunkSize) {
      const chunk = busStops.slice(i, i + chunkSize);
      await busStopsRepository.upsert(chunk, ["codParada"]);
    }
  }

  /**
   * get all bus stops from database
   */
  public static async getBusStops(): Promise<Paradas[]> {
    return await this.busStopsRepo.find();
  }

  /**
   * get ids of bus stops that belong to a specific line
   * @param lineId - line id to filter stops
   */
  public static async getBusStopsByLine(lineId: number): Promise<number[]> {
    const stopsIdsObjects = await this.linesStopsRepo.find({
      where: { codLinea: lineId },
      select: ["codParada"],
    });

    return stopsIdsObjects.map((obj) => obj.codParada);
  }
}
