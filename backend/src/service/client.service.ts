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

    public static async addClient(newClient: Client): Promise<void> {
        const clientRepository = DB.getRepository(Client);
        // Create the entity to add new client
        const client = clientRepository.create(newClient);
        // Bind each phone to the external relation needed
        client.phoneNums?.forEach(phone => {
            phone.client = client;
        });

        // Needed save instead of insert because insert does not trigger 'cascade' parameter
        await clientRepository.save(client);
    }

    public static async updateClient(clientID: number, newClientData: Client): Promise<Client | null> {
        const clientRepository = DB.getRepository(Client);
        const existingClient = await clientRepository.findOneBy({ id: clientID });

        if (!existingClient) {
            throw new Error('Cliente no found');
        }

        clientRepository.merge(existingClient, newClientData);
        return await clientRepository.save(existingClient);
    }


    public static async deleteClient(clientID: number): Promise<{ message: string }> {
        const clientRepository = DB.getRepository(Client);

        const existingClient = await clientRepository.findOneBy({ id: clientID });

        if (!existingClient) {
            throw new Error('Cliente no encontrado');
        }

        await clientRepository.remove(existingClient);

        return { message: 'Cliente eliminado correctamente' };
    }

}
