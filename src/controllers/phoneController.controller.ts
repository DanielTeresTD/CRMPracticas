import { Request, Response } from 'express';
import { GenResponse } from './genResponse.js';
import router from '../routes/clientRoutes.routes.js';
import { PhoneService } from '../service/phoneService.service.js';

export class PhoneController {
    public static async getPhonesFromClient(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            resp.data = await PhoneService.getPhonesFromClient(Number(req.params.id));
            resp.code = 200;
        } catch (error) {
            resp.msg = error as string;
            resp.code = 500;
        }

        res.json(resp);
    }
}