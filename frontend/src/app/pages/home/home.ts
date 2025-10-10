import { Component } from '@angular/core';
import { ClientTable } from '../../components/client-table/client-table';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ClientTable, MenubarModule, PanelModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  items: MenuItem[] = [];

  constructor() {
    this.items = [
      { label: 'Inicio', icon: 'pi pi-home', routerLink: ['/'] },
      { label: 'Clientes', icon: 'pi pi-users', routerLink: ['/clientes'] },
      { label: 'Configuración', icon: 'pi pi-cog', routerLink: ['/configuracion'] }
    ];
  }
}
