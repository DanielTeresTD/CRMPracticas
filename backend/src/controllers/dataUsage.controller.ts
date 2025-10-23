import { Request, Response } from 'express';
import { GenResponse } from './genResponse';
import { DataUsageService } from '../services/dataUsage.service';
import { PhoneService } from '../services/phone.service';

export class DataUsageController {
    public static async addDataUsage(req: Request, res: Response) {
        const resp = new GenResponse();

        try {
            const newDataUsage = req.body;

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

    public static async getStatisticsYearlyForPhone(req: Request, res: Response) {
        const resp = new GenResponse();
        const phoneId = Number(req.params.id);
        const currentUser = res.locals.user;
        let accessError = false;

        try {
            const userIdOfPhone = await PhoneService.getClientIdByPhone(phoneId);

            if (currentUser.role !== 'admin' && currentUser.clientId !== userIdOfPhone) {
                accessError = true;
                throw Error('Acces denied: You can not get other phone data appart of yours');
            }

            resp.data = await DataUsageService.getStatisticsForPhoneYearly(phoneId);
            resp.code = 200;
            resp.msg = 'Values of register obtained correctly';
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = accessError ? 403 : 500;
        }

        res.json(resp);
    }

    public static async getStatisticsMonthlyForPhone(req: Request, res: Response) {
        const resp = new GenResponse();
        const phoneId = Number(req.params.id);
        const year = Number(req.params.year);
        const currentUser = res.locals.user;
        let accessError = false;

        try {
            const userIdOfPhone = await PhoneService.getClientIdByPhone(phoneId);

            if (currentUser.role !== 'admin' && currentUser.clientId !== userIdOfPhone) {
                accessError = true;
                throw Error('Acces denied: You can not get other phone data appart of yours');
            }

            resp.data = await DataUsageService.getStatisticsForPhoneMonthly(phoneId, year);
            resp.code = 200;
            resp.msg = 'Values of register obtained correctly';
        } catch (error) {
            resp.msg = error instanceof Error ? error.message : String(error);
            resp.code = accessError ? 403 : 500;
        }

        res.json(resp);
    }
}
