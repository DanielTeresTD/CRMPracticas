import { Request, Response } from 'express';
import { GenResponse } from '../genResponse';
import { ParadasService } from '../../services/busesMalaga/paradas.service';

export class ParadasController {

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
