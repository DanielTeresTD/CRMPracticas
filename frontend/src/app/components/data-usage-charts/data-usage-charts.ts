import {
  Component, OnInit, ChangeDetectorRef,
  Input, OnChanges, SimpleChanges
} from '@angular/core';

import { StatisticsDataUsage } from '../../interfaces/dataUsage';
import { ClientPhone } from '../../interfaces/clients';

import Chart from 'chart.js/auto';


@Component({
  selector: 'app-data-usage-charts',
  imports: [],
  templateUrl: './data-usage-charts.html',
  styleUrl: './data-usage-charts.scss'
})
export class DataUsageCharts implements OnInit {
  @Input() clientPhones: ClientPhone[] = [];

  public ngOnInit(): void {

  }
}
