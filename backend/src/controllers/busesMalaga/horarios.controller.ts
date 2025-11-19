import { Request, Response } from "express";
import { GenResponse } from "../genResponse";
import { HorariosService } from "../../services/busesMalaga/horarios.service";

export class HorariosController {
  /**
   * Endpoint to store bus schedules from CSV files into the database
   * Responds with a success message when the process is completed
   * @param req - Express request object
   * @param res - Express response object
   */
  public static async storeBusSchedule(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      await HorariosService.storeBusSchedule();
      resp.code = 200;
      resp.msg = "Bus schedule loaded correctly";
    } catch (error) {
      if (error instanceof Error) {
        resp.msg = error.message;
      } else {
        resp.msg = String(error);
      }
      resp.code = 500;
    }

    res.json(resp);
  }

  /**
   * Endpoint to get bus stops for a given line ordered by direction and sequence
   * @param req - Express request object, expects `lineId` as a query parameter
   * @param res - Express response object
   */
  public static async getBusStopsOrdered(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const lineId = Number(req.query.lineId);
      resp.data = await HorariosService.getOrderedBusStops(lineId);
      resp.code = 200;
    } catch (error) {
      if (error instanceof Error) {
        resp.msg = error.message;
      } else {
        resp.msg = String(error);
      }
      resp.code = 500;
    }

    res.json(resp);
  }
}
