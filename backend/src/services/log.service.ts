import { DB } from '../config/typeorm';
import { Log } from '../entities/log.entity';
import { DeepPartial } from 'typeorm';

export class LogService {

    public static async add(log: DeepPartial<Log>): Promise<void> {
        const logRepository = DB.getRepository(Log);
        await logRepository.save(log);
    }

    public static async getById(userId: number): Promise<Object> {
        const logRepository = DB.getRepository(Log);
        let values = await logRepository.findBy({
            userId: {
                id: userId
            }
        });

        if (values.length === 0) {
            return { msg: "No logs found for this user" };
        }

        return values;
    }
}
