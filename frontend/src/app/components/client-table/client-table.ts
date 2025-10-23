import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientData, ClientPhone, UserData } from '../../interfaces/clients';
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
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/authService.service';

interface Column {
  field: string;
  header: string;
}

interface NewUser {
  userName: string,
  password: string,
  dni: string,
  role: string
}

const EMPTY_USER: UserData = {
  userName: '',
  password: '',
  dni: '',
  role: '',
  client: {
    name: '',
    address: '',
    email: '',
    dni: '',
    phoneNums: []
  }
};

@Component({
  selector: 'app-client-table',
  imports: [
    CommonModule, RouterModule, TableModule, TagModule,
    RatingModule, ButtonModule, ClientForm, DialogModule,
    DataUsageCharts, FormsModule
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
  public newUser: NewUser = {
    userName: '',
    password: '',
    dni: '',
    role: ''
  };
  public roles?: any[];

  constructor(
    private clientService: ClientService,
    private phoneService: PhoneService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getClients();
  }

  public getClients(): void {
    const role = this.clientRol();
    const clientId = Number(JSON.parse(localStorage.getItem("user") || '{}')?.clientId);

    const client_function = role === "admin" ?
      this.clientService.getClients()
      : this.clientService.getClientByID(Number(clientId));

    client_function.subscribe((data) => {
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
    this.showChart = false;
    this.cdr.detectChanges();
  }

  public showAddClientDialog(): void {
    // Used to put dynamicly each field in the form. 
    // ... is used to create a new object with the same properties of cte EMPTY_CLIENT
    this.selectedClient = { ...EMPTY_USER };
    this.formMode = 'add';
    this.clientPhones = [];
    this.showDialog = true;
  }

  public showCharts(): void {
    this.showChart = true;
    this.formMode = 'view';
  }

  // Retrieve form object from client-form componente and call add or edit (depends on the mode it is)
  public onFormSubmitted(formData: UserData): void {
    if (this.formMode === 'add') {
      this.clientService.addClient(formData.client!).subscribe(() => {
        this.getClients();
        this.closeDialog();
      });

      this.authService.register(formData).subscribe(() => {
        console.log("User created");
      });
    } else if (this.formMode === 'edit') {
      if (formData.client) {
        this.clientService.updateClient(Number(this.selectedClient?.id), formData.client!).subscribe(() => {
          this.getClients();
          this.closeDialog();
        });
      }

      this.authService.updateRegister(formData).subscribe(() => {
        console.log("User info updated");
      });
    }
  }

  public closeDialog(): void {
    this.selectedClient = undefined;
    this.clientPhones = [];
    this.showDialog = false;
    this.showChart = false;
  }

  public clientRol(): string {
    return JSON.parse(localStorage.getItem("user") || '{}')?.role;
  }
}
