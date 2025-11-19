import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // handle async data streams

@Injectable({ providedIn: 'root' })
export class BusesService {
  private readonly apiURL = enviroment.apiURL;

  constructor(private http: HttpClient) {}

  /**
   * fetch all bus lines with their name and code
   */
  public getNameCodeLines(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/lineas-buses/nom-cod`);
  }

  /**
   * fetch all bus stops
   */
  public getBusStops(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/paradas-buses`);
  }

  /**
   * fetch bus stops for a specific line
   * @param lineId - id of the line
   */
  public getBusStopsByLine(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/paradas-buses/linea?lineId=${lineId}`);
  }

  /**
   * fetch all lines that stop at a specific stop
   * @param stopId - id of the stop
   */
  public getLinesAtStop(stopId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(
      `${this.apiURL}/lineas-buses/lineas-en-parada?stopId=${stopId}`
    );
  }

  /**
   * force reload of all bus locations
   */
  public forceReloadBusLocations(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/`);
  }

  /**
   * fetch all buses with their current locations
   */
  public getBuses(): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/buses`);
  }

  /**
   * fetch all buses for a specific line
   * @param lineId - id of the line
   */
  public getBusesByLine(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/linea?lineId=${lineId}`);
  }

  /**
   * fetch ordered list of stops for a line
   * @param lineId - id of the line
   */
  public getBusStopsOrdered(lineId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/horarios/paradas-orden?lineId=${lineId}`);
  }

  /**
   * fetch historical locations log for a specific bus
   * @param busId - id of the bus
   */
  public getBusLocationsLog(busId: number): Observable<GenResponse> {
    return this.http.get<GenResponse>(`${this.apiURL}/ubicaciones-buses/bus-logs?busId=${busId}`);
  }
}
