import { Request, Response } from "express";
import { GenResponse } from "../genResponse";
import { UbicacionesService } from "../../services/busesMalaga/ubicaciones.service";

export class UbicacionesController {
  public static async storeBusLines(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      resp.data = await UbicacionesService.storeLocations();
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

  public static async getBuses(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      resp.data = await UbicacionesService.getLocationsBuses();
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

  public static async getBusByLine(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const lineId = Number(req.query.lineId);
      resp.data = await UbicacionesService.getLocationsByLineId(lineId);
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
