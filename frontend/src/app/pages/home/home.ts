import { Component } from '@angular/core';
import { ClientTable } from '../../components/client-table/client-table';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/authService.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ClientTable, MenubarModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  constructor(private authService: AuthService) {
  }

  public logout(): void {
    this.authService.logOut();
  }
}