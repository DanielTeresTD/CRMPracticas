import express from 'express';
import http from 'http';
import { PORT } from './config';
import IndexRoutes from '../routes/index.routes';
import cors from 'cors';

export class ExpressServer {
    private readonly port: number;
    private app: express.Application;
    private server?: http.Server;

    private readonly corsOptions = {
        origin: ["http://localhost:4200", "http://127.0.0.1:4200"]
    }

    constructor(port?: number) {
        this.port = port ?? PORT;
        this.app = express();

        this.app.use(express.json());
        this.app.use(cors(this.corsOptions));
        this.app.use('/api', IndexRoutes);


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
}