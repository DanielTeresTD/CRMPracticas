import {
  Component, OnInit, ChangeDetectorRef,
  Input, OnChanges, SimpleChanges
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { StatisticsDataUsage } from '../../interfaces/dataUsage';
import { ClientData, ClientPhone } from '../../interfaces/clients';

import { DataUsageService } from '../../services/dataUsage.service';
import { ExportToPdf } from '../export-to-pdf/export-to-pdf';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';


Chart.register(ChartDataLabels);

@Component({
  selector: 'app-data-usage-charts',
  imports: [CommonModule, ReactiveFormsModule, ExportToPdf, SelectModule, FormsModule,
    ButtonModule
  ],
  templateUrl: './data-usage-charts.html',
  styleUrl: './data-usage-charts.scss'
})
export class DataUsageCharts implements OnInit, OnChanges {
  // Only used to send to pdf the client data
  @Input() public client?: ClientData;
  @Input() public clientPhones: ClientPhone[] = [];
  @Input() public clientRole?: string;
  // Save yearly and monthly data
  public statisticsDataUsage?: StatisticsDataUsage;
  public statisticsDataUsageMonthly?: StatisticsDataUsage;

  // Alternate between monthly and yearly data
  public currentView: 'yearly' | 'monthly' = 'yearly';
  public selectedYear?: number;

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

  // Reset all values to default when new client is selected
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientPhones']) {
      this.selectedPhoneID = undefined;
      this.statisticsDataUsage = undefined;
      this.statisticsDataUsageMonthly = undefined;
      this.currentView = 'yearly';
      this.selectedYear = undefined;
      this.showDataUsageForm = false;
      this.destroyCharts();
    }

    if (changes['statisticsDataUsage'] || changes['statisticsDataUsageMonthly']) {
      if (this.statisticsDataUsage || this.statisticsDataUsageMonthly) {
        this.generateChart();
      }
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

  public onPhoneChanged(phoneID: number): void {
    this.currentView = 'yearly';
    this.statisticsDataUsageMonthly = undefined;
    this.selectedYear = undefined;
    this.showDataUsageForm = false;

    if (phoneID) {
      this.selectedPhoneID = phoneID;
      this.getYearlyDataUsage(phoneID);
    } else {
      this.selectedPhoneID = undefined;
      this.statisticsDataUsage = undefined;
      this.destroyCharts();
    }
  }
  // Alternate form between see and hide. If see mode is pressed, show values to enter data 
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
    // Check if form values are correct and create object which will be send to backend
    if (this.dataUsageForm?.valid && this.selectedPhoneID) {
      const payload = {
        phoneID: this.selectedPhoneID,
        ...this.dataUsageForm.value
      }

      this.dataUsageService.addDataUsageByPhone(payload).subscribe({
        next: () => {
          this.showDataUsageForm = false;
          this.getYearlyDataUsage(this.selectedPhoneID!);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('An error ocurred while adding new data usage', error);
        }
      })
    }
  }

  // Hide the form and reset with default values
  public onCancelAdd(): void {
    this.showDataUsageForm = false;
    this.dataUsageForm!.reset({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      dataUsage: 0
    });

    this.cdr.detectChanges();

    if (this.selectedPhoneID && this.statisticsDataUsage) {
      this.generateChart();
    }
  }

  // Get phone number filtering it with phoneID.
  public get selectedPhoneNumber(): string {
    if (!this.selectedPhoneID) return '';

    const selectedPhone = this.clientPhones.find(p => p.phoneID === this.selectedPhoneID);
    return selectedPhone?.phoneNumber || '';
  }

  // Call backend to fetch all yearly data usage of the current client
  private getYearlyDataUsage(phoneID: number): void {
    this.dataUsageService.getDataUsageYearlyByPhone(phoneID).subscribe({
      next: (response: any) => {
        this.statisticsDataUsage = response.data;
        this.currentView = 'yearly';
        this.generateChart();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('An error ocurred while fetching yearly data usage of the client\n', error);
      }
    });
  }

  // Same as getYearlyDataUsage but with months
  private getMonthlyDataUsage(year: number): void {
    if (!this.selectedPhoneID) return;

    this.dataUsageService.getDataUsageMonthlyByPhone(this.selectedPhoneID, year).subscribe({
      next: (response: any) => {
        this.statisticsDataUsageMonthly = response.data;
        this.selectedYear = year;
        this.currentView = 'monthly';
        this.generateChart();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('An error ocurred while fetching monthly data usage of the client', error);
      }
    });
  }

  public backToYearlyView(): void {
    this.currentView = 'yearly';
    this.selectedYear = undefined;
    this.statisticsDataUsageMonthly = undefined;
    this.generateChart();
  }

  public generateChart(): void {
    this.destroyCharts();

    // Decide if use yearly chart or monthly chart and check if values are loaded
    // before send it to charts.
    if (this.currentView === 'yearly') {
      if (!this.statisticsDataUsage?.dataUsage) {
        return;
      }
      this.yearlyUsageDataChart();
    } else {
      if (!this.statisticsDataUsageMonthly?.dataUsage) {
        return;
      }
      this.monthlyUsageDataChart();
    }

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
        labels: this.statisticsDataUsage!.dataUsage.map(row => row.year),
        datasets: [
          {
            label: 'Yearly Data Usage',
            data: this.statisticsDataUsage!.dataUsage.map(row => row.totalUsage),
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
        // When a year point of data was clicked, fetch all months data usage for that year
        onClick: (event, elements) => {
          if (elements.length > 0) {
            // Get position of point I clicked
            const dataIndex = elements[0].index;
            // Extract the year from the object that prints all years with data usage
            const clickedYear = this.statisticsDataUsage!.dataUsage[dataIndex].year!;
            this.getMonthlyDataUsage(clickedYear);
          }
        },
        scales: {
          y: {
            beginAtZero: true
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Yearly data usage',
            color: '#1f2937',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 30
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
            color: '#374151',
            align: 'top',
            anchor: 'center',
            offset: 10
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  private monthlyUsageDataChart(): void {
    const canvasDataUsage = document.getElementById('data-usage') as HTMLCanvasElement;
    if (!canvasDataUsage) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Same as yearly chart, only difference it´s used green color instead of blue
    this.lineChart = new Chart(canvasDataUsage, {
      type: 'line',
      data: {
        labels: this.statisticsDataUsageMonthly!.dataUsage.map(point => monthNames[point.month! - 1]),
        datasets: [
          {
            label: `Monthly Data Usage ${this.selectedYear}`,
            data: this.statisticsDataUsageMonthly!.dataUsage.map(point => point.totalUsage),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          title: {
            display: true,
            text: `Monthly Data Usage ${this.selectedYear}`,
            color: '#1f2937',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 30 }
          },
          datalabels: {
            formatter: function (value: number) {
              return `${Number(value).toFixed(2)}`;
            },
            font: { size: 11, weight: 'bold' },
            color: '#374151',
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

    let currentStats: StatisticsDataUsage;
    let titleText: string;

    if (this.currentView === 'yearly') {
      currentStats = this.statisticsDataUsage!;
      titleText = 'Annual Statistics - Data Usage';
    } else {
      currentStats = this.statisticsDataUsageMonthly!;
      titleText = `Monthly Statistics - Data Usage (${this.selectedYear})`;
    }

    this.barChart = new Chart(canvasStatistics, {
      type: 'bar',
      data: {
        labels: ['Mean', 'Max', 'Min'],
        datasets: [
          {
            label: this.currentView === 'yearly' ? 'Annual Statistics' : 'Monthly Statistics',
            data: [
              currentStats.mean,
              currentStats.maximum,
              currentStats.minimum
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
              text: 'Data Usage',
              color: '#1f2937'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: titleText,
            color: '#1f2937',
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
            color: '#374151',
            align: 'top',
            anchor: 'end',
            offset: 5
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  public getChartsForPDF(): any[] {
    const charts = [];

    // Solo incluir gráficos si existen
    if (this.lineChart && this.selectedPhoneNumber) {
      charts.push({
        canvas: this.lineChart.canvas,
        title: this.currentView === 'yearly' ?
          'Yearly Data Usage' :
          `Monthly Data Usage for ${this.selectedYear}`,
        phoneNumber: this.selectedPhoneNumber
      });
    }

    if (this.barChart && this.selectedPhoneNumber) {
      charts.push({
        canvas: this.barChart.canvas,
        title: this.currentView === 'yearly' ?
          'Annual Statistics' :
          `Monthly Statistics (${this.selectedYear})`,
        phoneNumber: this.selectedPhoneNumber
      });
    }

    return charts;
  }

  // Needed because jsPDF epxect image with base64 format.
  public getChartAsBase64(chartType: 'line' | 'bar'): string | null {
    const chart = chartType === 'line' ? this.lineChart : this.barChart;
    return chart ? chart.toBase64Image() : null;
  }
}
