export interface UsagePoint {
    year?: number;
    month?: number;
    totalUsage: number;
}

export interface StatisticsDataUsage {
    dataUsage: UsagePoint[],
    mean: number,
    maximum: number,
    minimum: number
}

export interface DataUsage {
    idRow: number,
    month: number,
    year: number,
    dataUsage: string,
    phone: { phoneID: number }
}