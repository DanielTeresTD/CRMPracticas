import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams

// Mark class avaliable to be provided and injected as dependency
@Injectable({ providedIn: 'root' })
export class PhoneService {
    private readonly apiURL = enviroment.apiURL;

    constructor(private http: HttpClient) { }
    // Call backend to retrieve data from db
    public getPhonesFromClient(clientID: number): Observable<GenResponse> {
        return this.http.get<GenResponse>(`${this.apiURL}/telefonos/${clientID}`);
    }
}