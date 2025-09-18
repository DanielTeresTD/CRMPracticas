import { RowDataPacket } from 'mysql2';
import connection from '../../.vscode/db'

export class PhoneService {
    public static async getPhonesFromClient(clientID: number): Promise<RowDataPacket[]> {
        // Select returns RowDataPacket, due to that it need´s to be specified
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT `PhoneNum` from `ClientPhones` WHERE `ClientID` = ?',
            [clientID]
        );

        return rows;
    }
}

