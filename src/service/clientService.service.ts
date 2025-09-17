import { RowDataPacket } from 'mysql2';
import { connection } from '../config/db.js'


export class ClientService {
    public static async getClients(): Promise<RowDataPacket[]> {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT `NameClient` FROM `Client`'
        );

        return rows;
    }
}
