import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientData } from '../../interfaces/clients';
import { RouterModule } from '@angular/router';

import { ClientDetailsDialog } from '../client-details-dialog/client-details-dialog';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-client-table',
  imports: [
    CommonModule, RouterModule, TableModule, TagModule,
    RatingModule, ButtonModule, ClientDetailsDialog
  ],
  templateUrl: './client-table.html',
  styleUrl: './client-table.scss'
})
export class ClientTable {
  @Input() clients: ClientData[] = [];
  // Enviar el evento a home para que se encargue home de añadir a la gente
  @Output() addClientRequest = new EventEmitter<void>();
  public cols: Column[] = [
    { field: 'name', header: 'Name' },
    { field: 'details', header: 'Details' }
  ];

  public selectedClient?: ClientData;
  public addClient: boolean = false;


  public showClientDialog(client: ClientData): void {
    this.selectedClient = client;
  }

  public closeDialog(): void {
    this.selectedClient = undefined;
  }

  public showAddClientDialog(): void {
    this.addClientRequest.emit();
  }


}
