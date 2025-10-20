import { AuthService } from "../services/authService.service";
import { CanActivate, Router } from "@angular/router";
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }
    canActivate(): boolean {
        if (this.auth.isAuthenticated()) {
            return true;
        }

        // Default path is login component.
        this.router.navigate(['']);
        return false;
    }
}