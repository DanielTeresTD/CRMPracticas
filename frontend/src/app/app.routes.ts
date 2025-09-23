import { Routes } from '@angular/router'
import { Home } from './pages/home/home'
import { ClientDetails } from './pages/client-details/client-details';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'cliente/:id',
        component: ClientDetails
    }
];