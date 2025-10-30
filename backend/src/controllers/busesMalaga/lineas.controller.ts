import { Request, Response } from 'express';
import { GenResponse } from '../genResponse';
import { LineasService } from '../../services/busesMalaga/lineas.service';

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
}
