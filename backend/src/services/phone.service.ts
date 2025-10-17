import { DB } from '../config/typeorm'
import { ClientPhones } from '../entities/phone.entity';

export class PhoneService {
    public static async getPhonesFromClient(clientIdParam: number): Promise<{ phoneID: number; phoneNumber: string }[]> {
        // Select returns RowDataPacket, due to that it need´s to be specified
        const clientPhonesRepository = DB.getRepository(ClientPhones);

        const phoneClients = await clientPhonesRepository.find({
            where: {
                client: {
                    id: clientIdParam
                }
            },
            select: ["phoneID", "phoneNumber"], // Para evitar traer columnas innecesarias
        });

        return phoneClients.map(phone => ({
            phoneID: phone.phoneID,
            phoneNumber: phone.phoneNumber
        }));
    }

    public static async getClientIdByPhone(phoneId: number): Promise<number> {
        const clientPhonesRepository = DB.getRepository(ClientPhones);
        const clientPhone = await clientPhonesRepository.findOne({
            where: { phoneID: phoneId },
            relations: ['client']
        });

        console.log(clientPhone);

        if (!clientPhone || !clientPhone.client) {
            throw Error("Client ID associated to phone was not found");
        }

        return clientPhone.client.id;
    }
}

