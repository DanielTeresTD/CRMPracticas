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

        // Unpack the object
        const { phoneNums, ...clientBasicData } = newClientData;

        // Only merge client data
        clientRepository.merge(existingClient, clientBasicData);
        let updatedClient: Client | null = await clientRepository.save(existingClient);


        // parse phone data of clients
        if (phoneNums && phoneNums.length > 0) {
            const currentPhoneIds = existingClient.phoneNums.map(phone => phone.phoneID);
            // phoneID of front (removing null ones with filter)
            const incomingPhoneIds = phoneNums
                .filter(phone => phone.phoneID)
                .map(phone => phone.phoneID);
            // Get phones that will be removed, these are the ones that exists in DB but not front.
            const phonesToDelete = currentPhoneIds.filter(id => !incomingPhoneIds.includes(id));

            // remove the phones needed.
            if (phonesToDelete.length > 0) {
                await phoneRepository
                    .createQueryBuilder()
                    .update(ClientPhones)
                    // need to call this lambda function to force typeorm put NULL.
                    .set({ client: () => 'NULL' })
                    // Delete all that have this ids. This function always use primary key
                    .whereInIds(phonesToDelete)
                    .execute();
            }

            // Separate phones (among id and number)
            const existingPhones = phoneNums.filter(phone => phone.phoneID);
            const newPhones = phoneNums.filter(phone => !phone.phoneID);

            // Actualizar teléfonos existentes
            for (const phone of existingPhones) {
                // update the refister with that phoneID
                await phoneRepository.update(phone.phoneID, {
                    phoneNumber: phone.phoneNumber
                });
            }

            for (const phone of newPhones) {
                const newPhone = phoneRepository.create({
                    phoneNumber: phone.phoneNumber,
                    client: existingClient
                });
                await phoneRepository.save(newPhone);
            }

            updatedClient = await clientRepository.findOne({
                where: { id: clientID },
                relations: ['phoneNums']
            });


        }

        return updatedClient;
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
