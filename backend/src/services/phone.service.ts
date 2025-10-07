import { DB } from '../config/typeorm'
import { ClientPhones } from '../entities/phone.entity';

export class PhoneService {
    public static async getPhonesFromClient(clientIDParam: number): Promise<{ phoneID: number; phoneNumber: string }[]> {
        // Select returns RowDataPacket, due to that it need´s to be specified
        const clientPhonesRepository = DB.getRepository(ClientPhones);

        const phoneClients = await clientPhonesRepository.find({
            where: {
                client: {
                    id: clientIDParam
                }
            },
            select: ["phoneID", "phoneNumber"], // Para evitar traer columnas innecesarias
        });

        return phoneClients.map(phone => ({
            phoneID: phone.phoneID,
            phoneNumber: phone.phoneNumber
        }));
    }
}

