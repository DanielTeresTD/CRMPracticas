import { DB } from "../../config/typeorm";
import { Lineas } from "../../entities/busesMalaga/lineas.entity";
import { ParadasService } from "./paradas.service";
import { LineasParadas } from "../../entities/busesMalaga/lineas_paradas.entity";
import { fetchBusApiData, storeByChunks } from "./busApi.service";

export class LineasService {
  private static readonly linesStopsRepo = DB.getRepository(LineasParadas);
  private static readonly busLinesRepo = DB.getRepository(Lineas);
  private static readonly linesRepo = DB.getRepository(Lineas);

  public static async storeBusLines(): Promise<void> {
    const limit = 6500;
    const data = await fetchBusApiData(
      process.env.API_BUS_LINES_STOPS!,
      process.env.RESOURCE_ID_BUS_LINES_STOPS!,
      limit
    );

    const rawRecords: any[] = data.result.records;
    // Create all bus stops from data retrieved
    await ParadasService.addBusStops(rawRecords);

    // Create lines of the data retrieved, it will be stored in array
    // data structure to pass to typeorm eassly
    const lines = rawRecords
      .filter(
        (actLine) => actLine.codLinea != null && actLine.nombreLinea != null
      )
      .map((actLine) => ({
        codLinea: actLine.codLinea,
        nombreLinea: actLine.nombreLinea,
        cabeceraIda: actLine.cabeceraIda,
        cabeceraVuelta: actLine.cabeceraVuelta,
      }));
    const chunkSize = 1024;
    const constraints = ["codLinea"];
    // Insert all lines in the table using chunks
    await storeByChunks(this.busLinesRepo, lines, constraints, chunkSize);

    const relationsBusStops = rawRecords
      .filter(
        (actLine) => actLine.codLinea != null && actLine.codParada != null
      )
      .map((actLine) => ({
        codLinea: actLine.codLinea,
        codParada: actLine.codParada,
      }));
    // Save has property to insert by chunkSizes
    constraints.push("codParada");
    await storeByChunks(
      this.linesStopsRepo,
      relationsBusStops,
      constraints,
      chunkSize
    );
  }

  public static async getLinesCodeName(): Promise<Partial<Lineas>[]> {
    return await this.linesRepo.find({ select: ["codLinea", "nombreLinea"] });
  }

  public static async getLinesAtStop(
    stopId: number
  ): Promise<{ codLinea: number; nombreLinea: string }[]> {
    const lines = await this.linesStopsRepo
      .createQueryBuilder("lp")
      .leftJoin(Lineas, "l", "l.codLinea = lp.codLinea")
      .where("lp.codParada = :stopId", { stopId })
      .select(["l.codLinea AS codLinea", "l.nombreLinea AS nombreLinea"])
      .getRawMany();

    return lines.map((l) => ({
      codLinea: l.codLinea,
      nombreLinea: l.nombreLinea,
    }));
  }
}
