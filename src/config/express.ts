import express from 'express';
import http from 'http';
import { PORT } from './config.js';
import ClientRoutes from '../routes/clientRoutes.routes.js';

export class ExpressServer {
    private readonly port: number;
    private app: express.Application;
    private server?: http.Server;

    constructor(port?: number) {
        this.port = port ?? PORT;
        this.app = express();

        this.app.use(express.json());
        this.app.use('/clientes', ClientRoutes);

        this.app.get('/', (req: express.Request, res: express.Response) => {
            res.send("Página principal");
        });
    }

    public start(callback: () => void): void {
        this.server = this.app.listen(this.port, callback);
    }

    public async stop(): Promise<void> {
        if (this.server) {
            await this.server.close(() => {
                console.log('Express server closed.');
            });
        } else {
            console.log("Server was not started before");
        }
    }

    public getPort(): number {
        return this.port;
    }
}