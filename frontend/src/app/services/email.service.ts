import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams

@Injectable({ providedIn: 'root' })
export class EmailService {
    private readonly apiURL = enviroment.apiURL;

    constructor(private http: HttpClient) { }

    public sendPdfToEmail(emailData: any): Observable<GenResponse> {
        return this.http.post<GenResponse>(`${this.apiURL}/email/send-pdf`, emailData);
    }
}