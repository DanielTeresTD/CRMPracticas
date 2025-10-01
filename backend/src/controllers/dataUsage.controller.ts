import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { DataUsageService } from '../service/dataUsage.service';

export class DataUsageController {
    public static async addDataUsage(req: Request, res: Response) {
        const resp = new GenResponse();

        try {
            const newDataUsage = req.body;
            console.log(newDataUsage);

            await DataUsageService.addDataUsage(newDataUsage);
            resp.code = 200;
            resp.msg = 'Register added correctly';
            resp.data = {};
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        res.json(resp);
    }

    public static async updateDataUsage(req: Request, res: Response) {
        const resp = new GenResponse();
        const idRow: number = Number(req.params.id);

        try {
            const newDataUsage = req.body;

            resp.data = await DataUsageService.updateDataUsage(idRow, newDataUsage);
            resp.code = 200;
            resp.msg = 'Register updated correctly';
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        res.json(resp);
    }

    public static async deleteDataUsage(req: Request, res: Response) {
        const resp = new GenResponse();
        const idRow: number = Number(req.params.id);

        try {
            resp.msg = await DataUsageService.deleteDataUsage(idRow);
            resp.data = {};
            resp.code = 200;
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        res.json(resp);
    }

    public static async getStatisticsForPhone(req: Request, res: Response) {
        const resp = new GenResponse();

        try {
            const phoneID = Number(req.params.id);

            resp.data = await DataUsageService.getStatisticsForPhone(phoneID);
            resp.code = 200;
            resp.msg = 'Values of register obtained correctly';
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = 500;
        }

        res.json(resp);
    }
}
