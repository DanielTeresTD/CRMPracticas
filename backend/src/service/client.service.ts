import { DB } from '../config/typeorm'
import { Client } from '../entities/client.entity';
import { ClientPhones } from '../entities/phone.entity';

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
        const phoneRepository = DB.getRepository(ClientPhones);

        const existingClient = await clientRepository.findOne({
            where: { id: clientID },
            relations: ['phoneNums']
        });

        if (!existingClient) {
            throw new Error('Client not found');
        }

        const { phoneNums, ...clientBasicData } = newClientData;
        clientRepository.merge(existingClient, clientBasicData);

        if (phoneNums && phoneNums.length > 0) {
            // ✅ Obtener IDs de teléfonos actuales en la DB
            const currentPhoneIds = existingClient.phoneNums.map(phone => phone.phoneID);

            // ✅ Obtener IDs de teléfonos que vienen del frontend
            const incomingPhoneIds = phoneNums
                .filter(phone => phone.phoneID)
                .map(phone => phone.phoneID);

            // ✅ Encontrar teléfonos a eliminar (están en DB pero no en frontend)
            const phonesToDelete = currentPhoneIds.filter(id => !incomingPhoneIds.includes(id));

            // ✅ Eliminar teléfonos que ya no están
            if (phonesToDelete.length > 0) {
                await phoneRepository
                    .createQueryBuilder()
                    .update(ClientPhones)
                    .set({ client: () => 'NULL' })
                    .whereInIds(phonesToDelete)
                    .execute();
            }

            // Separar teléfonos existentes de nuevos
            const existingPhones = phoneNums.filter(phone => phone.phoneID);
            const newPhones = phoneNums.filter(phone => !phone.phoneID);

            // Actualizar teléfonos existentes
            for (const phone of existingPhones) {
                await phoneRepository.update(phone.phoneID, {
                    phoneNumber: phone.phoneNumber
                });
            }

            // Crear nuevos teléfonos
            for (const phone of newPhones) {
                const newPhone = phoneRepository.create({
                    phoneNumber: phone.phoneNumber,
                    client: existingClient
                });
                await phoneRepository.save(newPhone);
            }

            const updatedClient = await clientRepository.findOne({
                where: { id: clientID },
                relations: ['phoneNums']
            });

            return updatedClient;
        }

        return await clientRepository.save(existingClient);
    }


    public static async deleteClient(clientID: number): Promise<string> {
        const clientRepository = DB.getRepository(Client);

        const existingClient = await clientRepository.findOneBy({ id: clientID });

        if (!existingClient) {
            throw new Error('Client not found');
        }

        await clientRepository.remove(existingClient);

        return 'Client deleted correctly';
    }

}
