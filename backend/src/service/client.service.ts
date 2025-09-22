import { DB } from '../config/typeorm'
import { Client } from '../entities/client.entity';


export class ClientService {
    public static async getClients(): Promise<string[]> {
        const clientRepository = DB.getRepository(Client);
        const clients = await clientRepository.find({
            select: ["name"]
        });

        return clients.map((client) => client.name);
    }
}
