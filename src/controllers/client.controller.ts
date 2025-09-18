import { Request, Response } from 'express';
import { GenResponse } from './genResponse.js';
import router from '../routes/client.routes.js';
import { ClientService } from '../service/client.service.js';

export class ClientController {
    public static async getClients(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            resp.data = await ClientService.getClients();
            resp.code = 200;
        } catch (error) {
            resp.msg = error as string;
            resp.code = 500;
        }

        res.json(resp);
    }
}