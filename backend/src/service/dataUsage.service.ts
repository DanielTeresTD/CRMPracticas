import { DB } from '../config/typeorm';
import { DataUsage } from '../entities/dataUsage.entity';
import { ClientPhones } from '../entities/phone.entity';

interface YearlyDataUsage {
  year: number;
  totalUsage: number;
}

interface StatisticsDataUsage {
  dataUsageYearly: YearlyDataUsage[],
  mean: number,
  maximum: number,
  minimum: number
}

export class DataUsageService {

  public static async addDataUsage(newDataUsage: any): Promise<void> {
    const dataUsageRepository = DB.getRepository(DataUsage);
    const phoneRepository = DB.getRepository(ClientPhones);
    const phone = await phoneRepository.findOne({
      where: { phoneID: newDataUsage.phoneID }
    });

    if (!phone) {
      throw new Error('Phone not found');
    }

    const dataUsage = dataUsageRepository.create({
      month: newDataUsage.month,
      year: newDataUsage.year,
      dataUsage: newDataUsage.dataUsage,
      phone: phone
    });
    await dataUsageRepository.save(dataUsage);
  }

  public static async updateDataUsage(idRow: number, newDataUsageData: DataUsage): Promise<DataUsage | null> {
    const dataUsageRepository = DB.getRepository(DataUsage);
    const existingDataUsage = await dataUsageRepository.findOneBy({ idRow });

    if (!existingDataUsage) {
      throw new Error('Registery of data usage not found');
    }

    dataUsageRepository.merge(existingDataUsage, newDataUsageData);
    return await dataUsageRepository.save(existingDataUsage);
  }

  public static async deleteDataUsage(idRow: number): Promise<string> {
    const dataUsageRepository = DB.getRepository(DataUsage);
    const existingDataUsage = await dataUsageRepository.findOneBy({ idRow });

    if (!existingDataUsage) {
      throw new Error('Registery of data usage not found');
    }

    await dataUsageRepository.remove(existingDataUsage);
    return 'Registery data usage deleted correctly';
  }

  public static async getStatisticsForPhone(phoneID: number): Promise<StatisticsDataUsage> {
    const statisticsDataUsage: StatisticsDataUsage = {
      dataUsageYearly: await this.getDataUsageYearly(phoneID),
      mean: await this.getMeanDataUsage(phoneID),
      maximum: await this.getMaximumDataUsage(phoneID),
      minimum: await this.getMinimumDataUsage(phoneID)
    }

    return statisticsDataUsage;
  }

  private static async getDataUsageYearly(phoneID: number): Promise<YearlyDataUsage[]> {
    const result = await DB
      .getRepository(DataUsage)
      .createQueryBuilder("data") // how will be called keys in the object returned
      .select("data.year", "year")
      .addSelect("SUM(data.dataUsage)", "totalUsage")
      .where("data.phoneID = :phoneID", { phoneID })
      .groupBy("data.year")
      .orderBy("data.year", "ASC")
      .getRawMany(); // Need when use sql functions to return raw data

    // Default value if no results were found
    if (!result || result.length === 0) {
      return [
        {
          year: new Date().getFullYear(),
          totalUsage: 0,
        },
      ];
    }

    const parsedResult: YearlyDataUsage[] = result.map((r) => ({
      year: Number(r.year),
      totalUsage: Math.round(parseFloat(r.totalUsage) * 100) / 100,
    }));

    return parsedResult;
  }

  private static async getMinimumDataUsage(phoneID: number): Promise<number> {
    const result = await DB
      .getRepository(DataUsage)
      .createQueryBuilder("data")
      .select("MIN(data.dataUsage)", "minVal")
      .where("data.phoneID = :phoneID", { phoneID })
      .getRawOne();

    return Math.round(parseFloat(result.minVal) * 100) / 100;
  }

  private static async getMaximumDataUsage(phoneID: number): Promise<number> {
    const result = await DB
      .getRepository(DataUsage)
      .createQueryBuilder("data")
      .select("MAX(data.dataUsage)", "maxVal")
      .where("data.phoneID = :phoneID", { phoneID })
      .getRawOne();

    return Math.round(parseFloat(result.maxVal) * 100) / 100;
  }

  private static async getMeanDataUsage(phoneID: number): Promise<number> {
    const result = await DB
      .getRepository(DataUsage)
      .createQueryBuilder("data")
      .select("AVG(data.dataUsage)", "meanVal")
      .where("data.phoneID = :phoneID", { phoneID })
      .getRawOne();

    return Math.round(parseFloat(result.meanVal) * 100) / 100;
  }
}
