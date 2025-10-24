import express from 'express';
import http from 'http';
import { PORT } from './config';
import IndexRoutes from '../routes/index.routes';
import AuthRoutes from '../routes/user.routes';
import authenticate from '../middlewares/authenticate';
import cors from 'cors';

export class ExpressServer {
    private readonly port: number;
    private app: express.Application;
    private server?: http.Server;

    private readonly corsOptions = {
        origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
        // Http methods allowed
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        // Content-type it´s for json apps
        // x-request to use XMLHttpRequest
        // Accept to indicate response waited
        allowedHeaders: ['Content-Type', 'X-Requested-With', 'Accept', 'Authorization'],
        optionsSuccessStatus: 200 // Indica code for success
    }

    constructor(port?: number) {
        this.port = port ?? PORT;
        this.app = express();

        // Increase size limit json
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(cors(this.corsOptions));
        // Login and register without authentication
        this.app.use('/auth', AuthRoutes);
        // All api users with authentication token
        this.app.use('/api', authenticate, IndexRoutes);


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