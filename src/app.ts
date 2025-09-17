import { db } from './config/db.js';
import './config/config.js';

await db.connect();

process.on('SIGINT', async () => {
    await db.disconnect();
})