import { Request, Response } from 'express';
import { GenResponse } from './genResponse.js';
import router from '../routes/client.routes.js';
import { PhoneService } from '../service/phone.service.js';

export class PhoneController {
    public static async getPhonesFromClient(req: Request, res: Response) {
        let resp = new GenResponse();
        const idClient: number = Number(req.params.id);

        try {
            resp.data = await PhoneService.getPhonesFromClient(idClient);
            resp.code = 200;
        } catch (error) {
            resp.msg = error as string;
            resp.code = 500;
        }

        res.json(resp);
    }
}