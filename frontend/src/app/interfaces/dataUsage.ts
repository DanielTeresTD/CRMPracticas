export interface YearlyDataUsage {
    year: number;
    totalUsage: number;
}

export interface StatisticsDataUsage {
    dataUsageYearly: YearlyDataUsage[],
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