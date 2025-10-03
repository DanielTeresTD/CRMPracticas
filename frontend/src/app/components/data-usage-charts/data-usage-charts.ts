import {
  Component, OnInit, ChangeDetectorRef,
  Input, OnChanges, SimpleChanges
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormControl
} from '@angular/forms';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { StatisticsDataUsage } from '../../interfaces/dataUsage';
import { ClientPhone } from '../../interfaces/clients';

import { DataUsageService } from '../../services/dataUsage.service';
import { CommonModule } from '@angular/common';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-data-usage-charts',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './data-usage-charts.html',
  styleUrl: './data-usage-charts.scss'
})
export class DataUsageCharts implements OnInit, OnChanges {
  @Input() public clientPhones: ClientPhone[] = [];
  public statisticsDataUsage?: StatisticsDataUsage;
  public lineChart?: Chart;
  public barChart?: Chart;
  public selectedPhoneID?: number;

  public dataUsageForm?: FormGroup;
  public showDataUsageForm: boolean = false;

  constructor(
    private dataUsageService: DataUsageService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.dataUsageForm = this.fb.group({
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [new Date().getFullYear(), Validators.required],
      dataUsage: [0, [Validators.required, Validators.min(0)]]
    });
  }

  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientPhones']) {
      this.selectedPhoneID = undefined;
      this.statisticsDataUsage = undefined;
      this.showDataUsageForm = false;
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
      this.showDataUsageForm = false;
      this.destroyCharts();
    }
  }

  // Alternate form between see and hide 
  public toggleAddForm(): void {
    this.showDataUsageForm = !this.showDataUsageForm;
    if (this.showDataUsageForm && this.dataUsageForm) {
      this.dataUsageForm.patchValue({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dataUsage: 0
      });
    }
  }

  public onSubmitDataUsage(): void {
    if (this.dataUsageForm?.valid && this.selectedPhoneID) {
      const payload = {
        phoneID: this.selectedPhoneID,
        ...this.dataUsageForm.value
      }

      this.dataUsageService.addDataUsageByPhone(payload).subscribe({
        next: () => {
          this.showDataUsageForm = true;
          this.getDataUsageByPhone(this.selectedPhoneID!);
        },
        error: (error) => {
          console.error('Error adding data usage', error);
        }
      })
    }
  }

  public onCancelAdd(): void {
    this.showDataUsageForm = false;
    this.dataUsageForm!.reset({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      dataUsage: 0
    });
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
