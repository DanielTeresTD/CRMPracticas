import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

import { Line, Stop } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';
import { BusesMap } from '../../components/buses-map/buses-map';

@Component({
  selector: 'app-buses',
  imports: [FormsModule, Select, BusesMap],
  templateUrl: './buses.html',
  styleUrl: './buses.scss',
})
export class Buses implements OnInit {
  public linesItems: Line[] | undefined;
  public selectedLine: Line | undefined;

  public stopItems: Stop[] | undefined;
  public stopItemsByLine: Stop[] | undefined;
  public selectedStop: Stop | undefined;

  constructor(private busesService: BusesService) {}

  public ngOnInit() {
    this.getNameCodeLines();
    this.getBusStops();
  }

  private getNameCodeLines(): void {
    this.busesService.getNameCodeLines().subscribe({
      next: (res) => {
        this.linesItems = res.data.map((line: Line) => ({
          ...line,
          label: `${line.codLinea} --> ${line.nombreLinea}`,
        }));
      },
      error: (err) => {
        console.error('An error ocurred while getting name and code of lines: ', err);
      },
    });
  }

  private getBusStops(): void {
    this.busesService.getBusStops().subscribe({
      next: (res) => {
        this.stopItems = res.data.map((stop: Stop) => ({
          ...stop,
          label: `${stop.codParada} --> ${stop.nombreParada}`,
        }));
      },
      error: (err) => {
        console.error('An error ocurred while getting bus stops: ', err);
      },
    });
  }

  onLineChange(event: any) {
    if (!event.value) {
      this.stopItemsByLine = []; // opcional: limpiar el selector de paradas
      this.selectedStop = undefined;
      return;
    }

    const lineId = event.value.codLinea;
    this.busesService.getBusStopsByLine(lineId).subscribe({
      next: (res) => {
        this.stopItemsByLine = this.stopItems!.filter((stop: Stop) =>
          res.data.some((codParada: number) => codParada === stop.codParada)
        );
      },
      error: (err) => {
        console.error('An error ocurred while getting bus stops by Line: ', err);
      },
    });
  }
}
