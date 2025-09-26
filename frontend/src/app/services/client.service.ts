import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams
import { ClientData } from '../interfaces/clients';

// Mark class avaliable to be provided and injected as dependency
@Injectable({ providedIn: 'root' })
export class ClientService {
    private readonly apiURL = enviroment.apiURL;

    constructor(private http: HttpClient) { }

    public getClients(): Observable<GenResponse> {
        return this.http.get<GenResponse>(`${this.apiURL}/clientes`);
    }

    public getClientByID(clientID: number): Observable<GenResponse> {
        return this.http.get<GenResponse>(`${this.apiURL}/clientes/${clientID}`)
    }

    public addClient(newClient: ClientData): Observable<GenResponse> {
        return this.http.post<GenResponse>(`${this.apiURL}/clientes`, newClient);
    }

    public updateClient(clientID: number, newClient: ClientData): Observable<GenResponse> {
        return this.http.put<GenResponse>(`${this.apiURL}/clientes/${clientID}`, newClient);
    }

    public removeClient(clientID: number): Observable<GenResponse> {
        return this.http.delete<GenResponse>(`${this.apiURL}/clientes/${clientID}`);
    }
}