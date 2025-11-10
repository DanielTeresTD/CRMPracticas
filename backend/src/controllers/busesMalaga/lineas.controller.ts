import { Request, Response } from "express";
import { GenResponse } from "../genResponse";
import { LineasService } from "../../services/busesMalaga/lineas.service";

export class LineasController {
  public static async storeBusLines(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      await LineasService.storeBusLines();
      resp.code = 200;
      resp.msg = "Bus lines and stops loaded correctly";
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

  public static async getLinesCodeName(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      resp.data = await LineasService.getLinesCodeName();
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

  public static async getLinesAtStop(req: Request, res: Response) {
    let resp = new GenResponse();

    try {
      const stopId = Number(req.query.stopId);
      resp.data = await LineasService.getLinesAtStop(stopId);
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
