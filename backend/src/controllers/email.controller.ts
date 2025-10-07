import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { EmailService } from '../services/email.service';

export class EmailController {
    public static async sendEmail(req: Request, res: Response) {
        const resp = new GenResponse();

        try {
            await EmailService.sendEmail();
            resp.code = 200;
            resp.msg = 'Email send';
            resp.data = {};
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        return res.json(resp);
    }
}
