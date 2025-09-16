import { Database } from './config/db.js';

const db = new Database();

await db.connect();

process.on('SIGINT', async () => {
    await db.disconnect();
})