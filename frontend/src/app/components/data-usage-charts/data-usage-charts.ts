import {
  Component, OnInit, ChangeDetectorRef,
  Input, OnChanges, SimpleChanges
} from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable } from 'rxjs';

import { StatisticsDataUsage } from '../../interfaces/dataUsage';
import { ClientPhone } from '../../interfaces/clients';

import { DataUsageService } from '../../services/dataUsage.service';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-data-usage-charts',
  imports: [],
  templateUrl: './data-usage-charts.html',
  styleUrl: './data-usage-charts.scss'
})
export class DataUsageCharts implements OnInit, OnChanges {
  @Input() public clientPhones: ClientPhone[] = [];
  public statisticsDataUsage?: StatisticsDataUsage;
  public lineChart?: Chart;
  public barChart?: Chart;
  public selectedPhoneID?: number;

  constructor(
    private dataUsageService: DataUsageService,
    private cdr: ChangeDetectorRef
  ) {

  }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientPhones']) {
      this.selectedPhoneID = undefined;
      this.statisticsDataUsage = undefined;
      this.destroyCharts();
    }
  }

  private destroyCharts(): void {
    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = undefined;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined;
    }
  }

  public onPhoneSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const phoneID = Number(select.value);

    if (phoneID) {
      this.selectedPhoneID = phoneID;
      this.getDataUsageByPhone(phoneID);
    } else {
      this.selectedPhoneID = undefined;
      this.statisticsDataUsage = undefined;
      this.destroyCharts();
    }
  }

  public get selectedPhoneNumber(): string {
    if (!this.selectedPhoneID) return '';

    const selectedPhone = this.clientPhones.find(p => p.phoneID === this.selectedPhoneID);
    return selectedPhone?.phoneNumber || '';
  }

  private getDataUsageByPhone(phoneID: number): void {
    this.dataUsageService.getDataUsageYearlyByPhone(phoneID).subscribe({
      next: (response: any) => {
        this.statisticsDataUsage = response.data;
        this.generateChart();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('An error ocurred while fetching data\n', error);
      }
    });
  }

  public generateChart(): void {
    this.destroyCharts();

    if (!this.statisticsDataUsage?.dataUsageYearly) {
      return;
    }

    this.yearlyUsageDataChart();
    this.basicStatisticsChart();
  }

  private yearlyUsageDataChart(): void {
    const canvasDataUsage = document.getElementById('data-usage') as HTMLCanvasElement;
    if (!canvasDataUsage) {
      return;
    }

    this.lineChart = new Chart(canvasDataUsage, {
      type: 'line',
      data: {
        labels: this.statisticsDataUsage!.dataUsageYearly.map(row => row.year),
        datasets: [
          {
            label: 'Uso de Datos por Año',
            data: this.statisticsDataUsage!.dataUsageYearly.map(row => row.totalUsage),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Yearly usage data',
            color: '#f8fafc',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          datalabels: {
            formatter: function (value: number) {
              return `${Number(value).toFixed(2)}`;
            },
            font: {
              size: 11,
              weight: 'bold'
            },
            color: '#f8fafc',
            align: 'top',
            anchor: 'center',
            offset: 10
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  private basicStatisticsChart(): void {
    const canvasStatistics = document.getElementById('data-usage-statistics') as HTMLCanvasElement;
    if (!canvasStatistics) {
      return;
    }

    this.barChart = new Chart(canvasStatistics, {
      type: 'bar',
      data: {
        labels: ['Mean', 'Max', 'Min'],
        datasets: [
          {
            label: 'Estadísticas de Uso',
            data: [
              this.statisticsDataUsage!.mean,
              this.statisticsDataUsage!.maximum,
              this.statisticsDataUsage!.minimum
            ],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(59, 130, 246, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)',
              'rgb(59, 130, 246)'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Basic statistics usage data',
            color: '#f8fafc',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          legend: {
            display: false
          },
          datalabels: {
            formatter: function (value: number) {
              return `${Number(value).toFixed(2)}`;
            },
            font: {
              size: 11,
              weight: 'bold'
            },
            color: '#f8fafc',
            align: 'top',
            anchor: 'end',
            offset: 5
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
}
