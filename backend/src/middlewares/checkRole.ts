import { Request, Response, NextFunction } from 'express';
import { GenResponse } from '../controllers/genResponse';

export function checkRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = res.locals.user;
        const resp = new GenResponse();

        if (!user || !allowedRoles.includes(user.role)) {
            resp.msg = 'You do not have enough privileges to use this service';
            resp.code = 403;
            res.status(resp.code).json(resp);
            return;
        }

        next();
    };
}