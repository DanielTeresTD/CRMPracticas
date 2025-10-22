import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { GenResponse } from '../controllers/genResponse';

export default async function authenticate(req: Request, res: Response,
    next: NextFunction): Promise<void> {

    const authHeader = req.header('Authorization');
    // Remove 'Bearer header' if authorization mode of JWT was selected as Bearer
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const resp = new GenResponse();

    if (!token) {
        resp.msg = 'Authorization token is required.';
        resp.code = 401;
        res.status(resp.code).json(resp);
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_PSSWD!);
        res.locals.user = decoded;
        next();
    } catch (err) {
        resp.msg = 'Invalid token.';
        resp.code = 401;
        res.status(resp.code).json(resp);
    }
}