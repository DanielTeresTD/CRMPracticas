import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/authService.service';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.menuItems = [
      { label: 'Clientes', icon: 'pi pi-phone', routerLink: '/home/clientes' },
      { label: 'Buses', icon: 'pi pi-truck', routerLink: '/home/buses' }
    ];
  }

  public logout(): void {
    this.authService.logOut();
  }
}