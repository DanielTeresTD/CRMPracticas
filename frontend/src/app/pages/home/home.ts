import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { ClientTable } from '../../components/client-table/client-table';
import { ClientData } from '../../interfaces/clients';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ClientTable],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  public clients: ClientData[] = [];

  constructor(private apiService: ClientService) { }
  // Execute this function when componente is loaded or reloaded
  ngOnInit(): void {
    this.getClients();
  }

  public getClients(): void {
    this.apiService.getClients().subscribe((data) => {
      this.clients = data.data;
    })
  }
}
