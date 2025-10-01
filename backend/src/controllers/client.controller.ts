import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { ClientService } from '../service/client.service';

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

    public static async getClientByID(req: Request, res: Response) {
        let resp = new GenResponse();
        const clientID: number = Number(req.params.id);

        try {
            resp.data = await ClientService.getClientByID(clientID);
            resp.code = 200;
        } catch (error) {
            resp.msg = error as string;
            resp.code = 500;
        }

        res.json(resp);
    }

    public static async addClient(req: Request, res: Response) {
        let resp = new GenResponse();

        try {
            const newClient = req.body
        
            resp.data = await ClientService.addClient(newClient);
            resp.code = 200;
        } catch (error) {
            resp.msg = error as string;
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
            resp.msg = error as string;
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
            resp.msg = error as string;
            resp.code = 500;
        }

        res.json(resp);
    }
}