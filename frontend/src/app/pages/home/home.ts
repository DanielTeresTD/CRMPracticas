import { Component } from '@angular/core';
import { ClientTable } from '../../components/client-table/client-table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ClientTable],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor() { }
}
