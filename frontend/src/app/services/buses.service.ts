import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams

@Injectable({ providedIn: 'root' })
export class BusesService {
  private readonly apiURL = enviroment.apiURL;

  constructor(private http: HttpClient) {}

  public getNameCodeLines(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/lineas-buses/nom-cod`);
  }

  public getBusStops(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/paradas-buses`);
  }

  public getBusStopsByLine(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/paradas-buses/linea?lineId=${lineId}`);
  }

  public getBuses(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/buses`);
  }

  public getBusesByLine(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/linea?lineId=${lineId}`);
  }

  public getBusStopsOrdered(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/horarios/paradas-orden?lineId=${lineId}`);
  }
}
