import { Request, Response } from "express";
import { GenResponse } from "../genResponse";
import { UbicacionesService } from "../../services/busesMalaga/ubicaciones.service";

export class UbicacionesController {
  /**
   * store all bus locations
   * calls UbicacionesService.storeLocations
   */
  public static async storeBusLines(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      await UbicacionesService.storeLocations();
      resp.code = 200;
    } catch (error) {
      resp.msg = error instanceof Error ? error.message : String(error);
      resp.code = 500;
    }

    res.json(resp);
  }

  /**
   * get all current buses
   * calls UbicacionesService.getLocationsBuses
   */
  public static async getBuses(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      resp.data = await UbicacionesService.getLocationsBuses();
      resp.code = 200;
    } catch (error) {
      resp.msg = error instanceof Error ? error.message : String(error);
      resp.code = 500;
    }

    res.json(resp);
  }

  /**
   * get buses for a specific line
   * @param req.query.lineId - line id to filter buses
   * calls UbicacionesService.getLocationsByLineId
   */
  public static async getBusByLine(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const lineId = Number(req.query.lineId);
      resp.data = await UbicacionesService.getLocationsByLineId(lineId);
      resp.code = 200;
    } catch (error) {
      resp.msg = error instanceof Error ? error.message : String(error);
      resp.code = 500;
    }

    res.json(resp);
  }

  /**
   * get location logs of a specific bus
   * @param req.query.busId - bus id to fetch logs
   * calls UbicacionesService.getBusLocationsLog
   */
  public static async getBusLocationsLog(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const busId = Number(req.query.busId);
      resp.data = await UbicacionesService.getBusLocationsLog(busId);
      resp.code = 200;
    } catch (error) {
      resp.msg = error instanceof Error ? error.message : String(error);
      resp.code = 500;
    }

    res.json(resp);
  }
}
