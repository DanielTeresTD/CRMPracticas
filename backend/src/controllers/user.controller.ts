import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { UserService } from '../services/user.service';

export class UserController {

    public static async register(req: Request, res: Response): Promise<Object> {
        let resp = new GenResponse();

        try {
            resp.data = await UserService.registerUser(req.body);
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

    public static async updateRegisterInfo(req: Request, res: Response): Promise<Object> {
        let resp = new GenResponse();

        try {
            resp.data = await UserService.updateRegister(req.body);
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

    public static async retrieveUserData(req: Request, res: Response): Promise<Object> {
        let resp = new GenResponse();
        const dni = req.params.dni;

        try {
            if (!dni) {
                throw Error("Not DNI was found");
            }

            resp.data = await UserService.findUserByDNI(dni);
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
