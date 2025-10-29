import schedule from 'node-schedule';
import { LineasService } from '../services/busesMalaga/lineas.service';

// Execute that job each day at 3:00 am
schedule.scheduleJob('0 0 3 * * *', async () => {
    try {
        await LineasService.storeBusLines();
        console.log('Job to update busLines and busStops executed succesfully');
    } catch (err) {
        console.error('Error while executing job to update busLines and busStops:\n', err);
    }
});