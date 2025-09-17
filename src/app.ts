import './config/config.js';
import { connection } from './config/db.js';
import { ExpressServer } from './config/express.js';

// Check connection to database
const server = new ExpressServer();

server.start(async () => {
    console.log(`[server]: Server is running at http://localhost:${server.getPort()}`);
    await connection.getConnection();
});

process.on('SIGINT', async () => {
    try {
        console.log('\n');
        server.stop();
        process.exit(0);
    } catch (error) {
        console.error('An error occured while closing:', error);
        process.exit(1);
    }
});