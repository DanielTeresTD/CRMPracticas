import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ClientTable } from '../../components/client-table/client-table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ClientTable],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  public clients: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getClients();
  }

  public getClients(): void {
    this.apiService.getClients().subscribe((data) => {
      this.clients = data.data;
    })
  }
}
