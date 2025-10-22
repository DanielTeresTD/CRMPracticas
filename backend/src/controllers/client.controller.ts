import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { ClientService } from '../services/client.service';

export class ClientController {
    public static async getClients(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            resp.data = await ClientService.getClients();
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

    public static async getClientByID(req: Request, res: Response) {
        let resp = new GenResponse();
        const clientId: number = Number(req.params.id);
        const currentUser = res.locals.user;
        let accessError = false;

        try {
            if (currentUser.rol !== 'admin' && currentUser.clientId !== clientId) {
                accessError = true;
                throw Error('Acces denied: You can only view your own data');
            }
            // Have same structure as getClients make use of DRY on front
            resp.data = [await ClientService.getClientByID(clientId)];
            resp.code = 200;
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = accessError ? 403 : 500;
        }

        res.json(resp);
    }

    public static async addClient(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            const newClient = req.body;
            console.log(newClient);

            resp.data = await ClientService.addClient(newClient);
            resp.code = 200;
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        res.json(resp);
    }


    public static async updateClient(req: Request, res: Response) {
        let resp = new GenResponse();
        const clientID: number = Number(req.params.id);

        try {
            const newClient = req.body
            resp.data = await ClientService.updateClient(clientID, newClient);
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

    public static async deleteClient(req: Request, res: Response) {
        let resp = new GenResponse();
        const clientID: number = Number(req.params.id);

        try {
            resp.msg = await ClientService.deleteClient(clientID);
            resp.data = {};
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