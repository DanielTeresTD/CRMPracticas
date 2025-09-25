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

    public static async addClient(newClient: Client): Promise<Client | null> {
        const clientRepository = DB.getRepository(Client);

        // Crear entidad cliente para que TypeORM maneje bien relaciones
        const client = clientRepository.create(newClient);

        // Asignar relación de teléfono a la entidad creada, no al objeto plano
        client.phoneNums?.forEach(phone => {
            phone.client = client;
        });

        return await clientRepository.save(client);
    }

    public static async updateClient(clientID: number, newClientData: Partial<Client>): Promise<Client | null> {
        const clientRepository = DB.getRepository(Client);

        const existingClient = await clientRepository.findOneBy({ id: clientID });

        if (!existingClient) {
            throw new Error('Cliente no encontrado');
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
