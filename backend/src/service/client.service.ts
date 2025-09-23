import { DB } from '../config/typeorm'
import { Client } from '../entities/client.entity';

export class ClientService {
    public static async getClients(): Promise<Client[]> {
        const clientRepository = DB.getRepository(Client);
        return await clientRepository.find();
    }

    public static async getClientByID(clientID: number): Promise<Client | null> {
        const clientRepository = DB.getRepository(Client);
        return await clientRepository.findOneBy({ id: clientID });
    }
}
