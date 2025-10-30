export async function fetchBusApiData(baseUrl: string, resourceId: string,
    limit: number = 100): Promise<any> {

    const url = `${baseUrl}?resource_id=${resourceId}&limit=${limit}`;

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