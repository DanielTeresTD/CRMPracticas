import { DB } from '../config/typeorm'
import { ClientPhones } from '../entities/phone.entity';

export class PhoneService {
    public static async getPhonesFromClient(clientIDParam: number): Promise<string[]> {
        // Select returns RowDataPacket, due to that it need´s to be specified
        const clientPhonesRepository = DB.getRepository(ClientPhones);
        const phoneClients = await clientPhonesRepository.find({
            where: {
                client: {
                    id: clientIDParam
                }
            }
        })

        return phoneClients.map(phone => phone.phoneNumber);
    }
}

