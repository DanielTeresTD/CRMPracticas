import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { ClientTable } from '../../components/client-table/client-table';
import { ClientData } from '../../interfaces/clients';
import { ClientDetailsDialog } from '../../components/client-details-dialog/client-details-dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ClientTable, ClientDetailsDialog],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  public clients: ClientData[] = [];
  public showAddDialog = false;

  constructor(private clientService: ClientService, private cdr: ChangeDetectorRef) { }
  // Execute this function when componente is loaded or reloaded
  ngOnInit(): void {
    this.getClients();
  }

  public getClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data.data;
      this.cdr.detectChanges(); // le dices a Angular que revise los cambios
    });
  }


  public openAddClientDialog() {
    this.showAddDialog = true;
  }

  public closeDialog() {
    this.showAddDialog = false;
  }
}
