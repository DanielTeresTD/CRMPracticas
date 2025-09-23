import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientData } from '../../interfaces/clients';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-client-table',
  imports: [CommonModule, RouterModule, TableModule],
  templateUrl: './client-table.html',
  styleUrl: './client-table.scss'
})
export class ClientTable {
  @Input() clients: ClientData[] = [];
  public cols: Column[] = [
    { field: 'name', header: 'Name' },
    { field: 'moreData', header: 'More Data' }
  ];
}
