import { DB } from '../../config/typeorm';
import { Lineas } from '../../entities/busesMalaga/lineas.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ParadasService } from './paradas.service';
import { LineasParadas } from '../../entities/busesMalaga/lineas_paradas.entity';

export class LineasService {

    public static async storeBusLines(): Promise<Lineas[]> {
        let data: any;

        try {
            const baseUrl = process.env.API_LINEAS_PARADAS!;
            const resourceId = process.env.RESOURCE_ID_LINEAS_PARADAS!;
            const url = `${baseUrl}?resource_id=${resourceId}&limit=30`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            data = await response.json();

        } catch (error) {
            console.error('Error while fetching bus lines: ', error);
            throw error;
        }

        const rawRecords: any[] = data.result.records;
        const busLinesRepository = DB.getRepository(Lineas);
        const lineasParadasRepo = DB.getRepository(LineasParadas);
        // Create all bus stops from data retrieved
        await ParadasService.addBusStops(rawRecords);

        // Create lines of the data retrieved, it will be stored in array
        // data structure to pass to typeorm eassly
        const lines = rawRecords
            .filter(record => record.codLinea != null && record.codParada != null)
            .map(record => ({
                codLinea: record.codLinea,
                nombreLinea: record.nombreLinea,
                cabeceraIda: record.cabeceraIda,
                cabeceraVuelta: record.cabeceraVuelta
            }));
        const chunkSize = 1024;
        // Insert all lines in the table using chunks
        await this.storeLinesByChunks(busLinesRepository, lines, chunkSize);

        const relationsBusStops = rawRecords
            .filter(record => record.codLinea != null && record.codParada != null)
            .map(record => ({
                codLinea: record.codLinea,
                codParada: record.codParada
            }));
        // Save has property to insert by chunkSizes
        await lineasParadasRepo.save(relationsBusStops, { chunk: chunkSize });

        return data.result.records as Lineas[];
    }

    private static async storeLinesByChunks(busLinesRepository: Repository<Lineas>,
        busLines: Array<DeepPartial<Lineas>>, chunkSize: number): Promise<void> {
        for (let i = 0; i < busLines.length; i += chunkSize) {
            const chunk = busLines.slice(i, i + chunkSize);
            // Upsert only add register with diferents "codLine" (in this case)
            // If other register is repeated with same "codLine", it will be 
            // ignored. 
            // Sumarising, that avoid duplicate registers given second param.
            await busLinesRepository.upsert(chunk, ["codLinea"]);
        }
    }
}
