import { Routes } from '@angular/router'
import { Home } from './pages/home/home'
import { Login } from './pages/login/login'
import { Register } from './pages/register/register'
import { AuthGuard } from './guards/authGuard'

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'home',
        component: Home,
        canActivate: [AuthGuard]
    },
    {
        path: 'register',
        component: Register
    },
];