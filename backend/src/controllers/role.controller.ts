import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { RoleService } from '../services/role.service';

export class RoleController {
    public static async getRoles(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            resp.data = await RoleService.getRoles();
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
