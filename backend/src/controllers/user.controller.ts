import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { UserService } from '../services/user.service';

export class UserController {

    public static async add(req: Request, res: Response): Promise<Object> {
        let resp = new GenResponse();

        try {
            await UserService.registerUser(req.body);
            resp.code = 200;
        } catch (error) {
            if (error instanceof Error) {
                resp.msg = error.message;
            } else {
                resp.msg = String(error);
            }
            resp.code = 500;
        }

        return res.json(resp);
    }

    public static async login(req: Request, res: Response): Promise<Object> {
        let resp = new GenResponse();

        try {
            resp.data = await UserService.login(req.body);
            resp.code = 200;
        } catch (error) {
            if (error instanceof Error) {
                resp.msg = error.message;
            } else {
                resp.msg = String(error);
            }
            resp.code = 500;
        }

        return res.json(resp);
    }
}
