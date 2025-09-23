import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-client-table',
  imports: [CommonModule],
  templateUrl: './client-table.html',
  styleUrl: './client-table.scss'
})
export class ClientTable {
  @Input() clients: string[] = [];
}
