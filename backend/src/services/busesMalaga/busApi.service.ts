import { Repository, DeepPartial } from "typeorm";

export async function fetchBusApiData(baseUrl: string, resourceId: string,
    limit: number = -1): Promise<any> {

    let url: string = `${baseUrl}?resource_id=${resourceId}`;

    if (limit != -1) {
        url = `${baseUrl}?resource_id=${resourceId}&limit=${limit}`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} while consulting ${url}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error while fetching data:', error);
        throw error;
    }
}

export async function storeByChunks(
    repo: Repository<any>,
    data: Array<DeepPartial<any>>,
    constraints: Array<string>,
    chunkSize: number): Promise<any> {
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        // Upsert only add register with diferents "codLine" (in this case)
        // If other register is repeated with same "codLine", it will be 
        // updated if others values were provided. 
        // Sumarising, that avoid duplicate registers given second param.
        await repo.upsert(chunk, constraints);
    }
}