import { Repository, DeepPartial } from "typeorm";

/**
 * fetch data from a bus API
 * @param baseUrl - base url of the API
 * @param resourceId - id of the resource to fetch
 * @param limit - optional maximum number of items to fetch, -1 for no limit
 * @returns a promise resolving with the fetched data
 * @throws throws an error if the fetch fails or response is not ok
 */
export async function fetchBusApiData(
  baseUrl: string,
  resourceId: string,
  limit: number = -1
): Promise<any> {
  let url: string = `${baseUrl}?resource_id=${resourceId}`;
  if (limit !== -1) {
    url = `${baseUrl}?resource_id=${resourceId}&limit=${limit}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} while consulting ${url}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error while fetching data:", error);
    throw error;
  }
}

/**
 * stores data in the database repository in chunks with upsert
 * avoids duplicate entries using constraints
 * @param repo - typeorm repository
 * @param data - array of partial entities to store
 * @param constraints - list of column names to prevent duplicates (used in upsert)
 * @param chunkSize - number of items to insert per batch
 */
export async function storeByChunks(
  repo: Repository<any>,
  data: Array<DeepPartial<any>>,
  constraints: Array<string>,
  chunkSize: number
): Promise<any> {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    // upsert avoids duplicates using the constraints array
    await repo.upsert(chunk, constraints);
  }
}
