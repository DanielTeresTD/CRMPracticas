import { Component, inject } from '@angular/core';
import { ClientData } from '../../interfaces/clients';
import { ActivatedRoute } from '@angular/router';
import { PhoneService } from '../../services/phone.service';
import { ClientService } from '../../services/client.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-details',
  imports: [CommonModule],
  templateUrl: './client-details.html',
  styleUrl: './client-details.scss'
})
export class ClientDetails {
  public client?: ClientData;
  public clientPhones: string[] = [];
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private phoneService: PhoneService,
    private clientService: ClientService
  ) { }

  ngOnInit(): void {
    // Make snapshot to take the route defined
    let clientID = Number(this.activatedRoute.snapshot.params['id']);
    this.getPhonesFromClient(clientID);
    this.getDataFromClient(clientID);
  }

  public getPhonesFromClient(clientID: number): void {
    this.phoneService.getPhonesFromClient(clientID).subscribe((data) => {
      this.clientPhones = data.data;
    })
  }

  public getDataFromClient(clientID: number): void {
    this.clientService.getClientByID(clientID).subscribe((data) => {
      this.client = data.data;
    })
  }
}
