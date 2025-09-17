import { RowDataPacket } from 'mysql2';
import { db } from '../config/db.js'

const connection = db.getConnection();

export async function getPhonesFromClient(clientID: number): Promise<RowDataPacket[]> {
    // Select returns RowDataPacket, due to that it need´s to be specified
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT `PhoneNum` from `ClientPhones` WHERE `ClientID` = ?',
        [clientID]
    );

    return rows;
}