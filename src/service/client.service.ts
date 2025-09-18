import { RowDataPacket } from 'mysql2';
import connection from '../config/db'


export class ClientService {
    public static async getClients(): Promise<RowDataPacket[]> {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT `NameClient` FROM `Client`'
        );

        return rows;
    }
}
