import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientData, ClientPhone } from '../../interfaces/clients';
import { RouterModule } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { PhoneService } from '../../services/phone.service';

import { ClientForm } from '../client-form/client-form';
import { DataUsageCharts } from '../data-usage-charts/data-usage-charts';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Column {
  field: string;
  header: string;
}

const EMPTY_CLIENT: ClientData = {
  name: '',
  address: '',
  phoneNums: []
};

@Component({
  selector: 'app-client-table',
  imports: [
    CommonModule, RouterModule, TableModule, TagModule,
    RatingModule, ButtonModule, ClientForm, DialogModule,
    DataUsageCharts
  ],
  templateUrl: './client-table.html',
  styleUrl: './client-table.scss'
})
export class ClientTable implements OnInit {
  clients: ClientData[] = [];
  clientPhones: ClientPhone[] = [];

  public cols: Column[] = [
    { field: 'name', header: 'Name' },
    { field: 'details', header: 'Details' }
  ];

  public showDialog: boolean = false;
  public selectedClient?: ClientData;
  public showChart: boolean = false;
  public formMode: 'view' | 'edit' | 'add' = 'view';

  constructor(
    private clientService: ClientService,
    private phoneService: PhoneService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getClients();
  }

  public getClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data.data;
      this.cdr.detectChanges();
    });
  }

  public removeClient(): void {
    this.clientService.removeClient(Number(this.selectedClient!.id)).subscribe((data) => {
      this.getClients();
    });
    this.showDialog = false;
  }

  public getPhonesFromClient(clientID: number): void {
    this.phoneService.getPhonesFromClient(clientID).subscribe((data) => {
      this.clientPhones = data.data;
      this.cdr.detectChanges();
    })
  }

  public showClientDialog(client: ClientData): void {
    this.selectedClient = client;
    this.formMode = 'view';
    this.clientPhones = [];
    if (client.id) {
      this.getPhonesFromClient(client.id);
    }
    this.showDialog = true;
  }

  public showEditClientDialog(): void {
    this.formMode = 'edit';
  }

  public showAddClientDialog(): void {
    // Used to put dynamicly each field in the form. 
    // ... is used to create a new object with the same properties of cte EMPTY_CLIENT
    this.selectedClient = { ...EMPTY_CLIENT };
    this.formMode = 'add';
    this.clientPhones = [];
    this.showDialog = true;
  }

  // Retrieve form object from client-form componente and call add or edit (depends on the mode it is)
  public onFormSubmitted(formData: ClientData): void {
    if (this.formMode === 'add') {
      this.clientService.addClient(formData).subscribe(() => {
        this.getClients();
        this.closeDialog();
      });
    } else if (this.formMode === 'edit') {
      this.clientService.updateClient(Number(this.selectedClient?.id), formData).subscribe(() => {
        this.getClients();
        this.closeDialog();
      });
    }
  }

  public showCharts(): void {
    this.showChart = true;
  }

  public closeDialog(): void {
    this.selectedClient = undefined;
    this.clientPhones = [];
    this.showDialog = false;
    this.showChart = false;
  }
}
