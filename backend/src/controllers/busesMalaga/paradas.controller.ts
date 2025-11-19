import { Request, Response } from "express";
import { GenResponse } from "../genResponse";
import { ParadasService } from "../../services/busesMalaga/paradas.service";

export class ParadasController {
  /**
   * get all bus stops
   * responds with a general response containing all stops
   * @param req - express request object
   * @param res - express response object
   */
  public static async getBusStops(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      resp.data = await ParadasService.getBusStops();
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

  /**
   * get bus stops by line id
   * responds with a general response containing stop IDs for a specific line
   * @param req - express request object (expects query.lineId)
   * @param res - express response object
   */
  public static async getBusStopsByLine(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const lineId = Number(req.query.lineId);
      resp.data = await ParadasService.getBusStopsByLine(lineId);
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
