import { DB } from '../../config/typeorm';
import { Paradas } from '../../entities/busesMalaga/paradas.entity';
import { DeepPartial, Repository } from 'typeorm';

export class ParadasService {

    public static async addBusStops(rawRecords: any[]): Promise<void> {
        const busStopsRepository = DB.getRepository(Paradas);
        // Only get values that aren´t null and create an array
        const busStops = rawRecords
            .filter(item => item.codParada != null && item.nombreParada != null)
            .map(item => ({
                codParada: item.codParada,
                nombreParada: item.nombreParada,
                direccion: item.direccion,
                lat: item.lat,
                lon: item.lon
            }));
        const chunkSize = 1024;
        await this.storeBusStopsByChunks(busStopsRepository, busStops, chunkSize);
    }

    private static async storeBusStopsByChunks(busStopsRepository: Repository<Paradas>,
        busStops: Array<DeepPartial<Paradas>>, chunkSize: number): Promise<void> {
        for (let i = 0; i < busStops.length; i += chunkSize) {
            const chunk = busStops.slice(i, i + chunkSize);
            await busStopsRepository.upsert(chunk, ["codParada"]);
        }
    }
}
