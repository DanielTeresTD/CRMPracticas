import { Database } from './config/db.js';
import './config/config.js';

const db = new Database();

await db.connect();

process.on('SIGINT', async () => {
    await db.disconnect();
})