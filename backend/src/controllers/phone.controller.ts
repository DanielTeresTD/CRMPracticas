import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { PhoneService } from '../services/phone.service';

export class PhoneController {
    public static async getPhonesFromClient(req: Request, res: Response) {
        let resp = new GenResponse();
        const idClient: number = Number(req.params.id);

        try {
            resp.data = await PhoneService.getPhonesFromClient(idClient);
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