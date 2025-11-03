import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AuthGuard } from './guards/authGuard';
import { Buses } from './pages/buses/buses';
import { ClientTable } from './components/client-table/client-table';

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'home',
        component: Home,
        canActivate: [AuthGuard],
        children: [
            { path: 'clientes', component: ClientTable },
            { path: 'buses', component: Buses },
            // Documentation says it´s necesary tu pathMatch full when
            // redirect when empty route was called
            { path: '', redirectTo: 'clientes', pathMatch: 'full' }
        ]
    },
    {
        path: 'register',
        component: Register
    },

];