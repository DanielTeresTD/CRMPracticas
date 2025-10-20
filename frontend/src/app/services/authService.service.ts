import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroment/enviroment';
import { GenResponse } from '../interfaces/genResponse';
import { Observable } from 'rxjs'; // Handle async data streams
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Mark class avaliable to be provided and injected as dependency
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly authURL = enviroment.authURL;

    constructor(private http: HttpClient, private router: Router) { }

    public register(userData: any): Observable<GenResponse> {
        return this.http.post<GenResponse>(`${this.authURL}/register`, userData);
    }

    public login(userData: any): Observable<GenResponse> {
        return this.http.post<GenResponse>(`${this.authURL}/login`, userData).pipe(
            tap(response => {
                localStorage.setItem('token', response.data.token);
                // Convert object to string
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));

                if (user && user.rol) {
                    this.router.navigate(['/home']);
                } else {
                    this.router.navigate(['']);
                }
            }));
    }

    public isAuthenticated(): boolean {
        return localStorage.getItem('token') ? true : false;
    }

    public logOut(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.router.navigate(['']);
    }
}