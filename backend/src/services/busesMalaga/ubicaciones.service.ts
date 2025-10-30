import { DeepPartial, Repository } from 'typeorm';
import { DB } from '../../config/typeorm';
import { Ubicacionnes } from '../../entities/busesMalaga/ubicaciones.entity';
import { fetchBusApiData } from './busApi.service';

export class UbicacionesService {

    public static async storeLocations(): Promise<DeepPartial<Ubicacionnes>[]> {
        const data = await fetchBusApiData(
            process.env.API_BUS_LOCATIONS!,
            process.env.RESOURCE_ID_BUS_LOCATIONS!
        );

        const rawRecords: any[] = data.result.records;
        const locationsRepository = DB.getRepository(Ubicacionnes);
        const locationsParsed: DeepPartial<Ubicacionnes>[] = rawRecords.map(record => ({
            codBus: record.codBus,
            codLinea: record.codLinea,
            sentido: record.sentido,
            lat: record.lat,
            lon: record.lon
        }));

        const chunkSize = 1024;
        await this.storeLocationsByChunks(locationsRepository, locationsParsed, chunkSize);
        return locationsParsed;
    }

    private static async storeLocationsByChunks(locationsRepository: Repository<Ubicacionnes>,
        busLocations: Array<DeepPartial<Ubicacionnes>>, chunkSize: number): Promise<void> {
        for (let i = 0; i < busLocations.length; i += chunkSize) {
            const chunk = busLocations.slice(i, i + chunkSize);
            // Upsert only add register with diferents "codLine" (in this case)
            // If other register is repeated with same "codLine", it will be 
            // updated if others values were provided. 
            // Sumarising, that avoid duplicate registers given second param.
            await locationsRepository.upsert(chunk, ["codBus", "codLinea"]);
        }
    }
}
