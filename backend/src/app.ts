import './config/config';
import 'reflect-metadata';
import { initOrm } from './config/typeorm';
import { ExpressServer } from './config/express';
import './config/scheduler';

// Check connection to database
const server = new ExpressServer();

server.start(async () => {
    await initOrm();
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