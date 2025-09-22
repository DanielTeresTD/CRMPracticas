import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams

// Mark class avaliable to be provided and injected as dependency
@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly apiURL = enviroment.apiURL;
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    public getClients(): Observable<GenResponse> {
        return this.http.get(`${this.apiURL}/clientes`);
    }
}