import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientData } from '../../interfaces/clients';
import { PhoneService } from '../../services/phone.service';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-client-details-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './client-details-dialog.html',
  styleUrl: './client-details-dialog.scss'
})
export class ClientDetailsDialog implements OnInit {
  @Input() client!: ClientData;
  @Input() visible: boolean = false;
  @Input() addClient: boolean = false;
  @Input() onClose!: () => void;

  public clientPhones: string[] = [];

  constructor(private phoneService: PhoneService) { }

  ngOnInit(): void {
    if (this.client && this.client.id) {
      this.getPhonesFromClient(this.client.id);
    } else {
      throw Error("ID of client selected is invalid.");
    }
  }

  public getPhonesFromClient(clientID: number): void {
    this.phoneService.getPhonesFromClient(clientID).subscribe((data) => {
      this.clientPhones = data.data;
    })
  }
}
