import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams
import { StatisticsDataUsage, DataUsage } from '../interfaces/dataUsage';

@Injectable({ providedIn: 'root' })
export class DataUsageService {
    private readonly apiURL = enviroment.apiURL;

    constructor(private http: HttpClient) { }

    public getDataUsageYearlyByPhone(phoneID: number): Observable<GenResponse> {
        return this.http.get<GenResponse>(`${this.apiURL}/consumo-datos/${phoneID}`);
    }

    public addDataUsageByPhone(dataUsage: DataUsage): Observable<GenResponse> {
        return this.http.post<GenResponse>(`${this.apiURL}/consumo-datos`, dataUsage);
    }

    public updateDataUsageByPhone(rowID: number, newDataUsage: DataUsage): Observable<GenResponse> {
        return this.http.put<GenResponse>(`${this.apiURL}/consumo-datos/${rowID}`, newDataUsage);
    }

    public deleteDataUsageByPhone(rowID: number): Observable<GenResponse> {
        return this.http.delete<GenResponse>(`${this.apiURL}/consumo-datos/${rowID}`);
    }

}