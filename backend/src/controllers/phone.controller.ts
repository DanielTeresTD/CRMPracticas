import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { PhoneService } from '../services/phone.service';

export class PhoneController {
    public static async getPhonesFromClient(req: Request, res: Response) {
        let resp = new GenResponse();
        const clientId: number = Number(req.params.id);
        const currentUser = res.locals.user;
        let accessError = false;

        try {
            if (currentUser.role !== 'admin' && currentUser.clientId !== clientId) {
                accessError = true;
                throw Error('Acces denied: You can only view your own data');
            }

            resp.data = await PhoneService.getPhonesFromClient(clientId);
            resp.code = 200;
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = accessError ? 403 : 500;
        }

        res.json(resp);
    }
}