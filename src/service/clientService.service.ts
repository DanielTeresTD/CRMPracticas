import { RowDataPacket } from 'mysql2';
import { db } from '../config/db.js'

const connection = db.getConnection();

export async function getClients(): Promise<RowDataPacket[]> {
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT `NameClient` FROM `Clients`'
    );

    return rows;
}