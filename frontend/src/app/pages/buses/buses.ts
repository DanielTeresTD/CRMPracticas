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
  /** list of all bus lines */
  public linesItems: Line[] | undefined;

  /** currently selected bus line */
  public selectedLine: Line | undefined;

  /** list of all bus stops */
  public stopItems: Stop[] | undefined;

  /** bus stops filtered by selected line */
  public stopItemsByLine: Stop[] | undefined;

  /** currently selected stop */
  public selectedStop: Stop | undefined;

  constructor(private busesService: BusesService) {}

  /** initialize component: fetch lines and stops */
  public ngOnInit() {
    this.getNameCodeLines();
    this.getBusStops();
  }

  /** fetch all bus lines with name and code */
  private getNameCodeLines(): void {
    this.busesService.getNameCodeLines().subscribe({
      next: (res) => {
        this.linesItems = res.data.map((line: Line) => ({
          ...line,
          label: `${line.codLinea} --> ${line.nombreLinea}`,
        }));
      },
      error: (err) => {
        console.error('An error occurred while getting name and code of lines: ', err);
      },
    });
  }

  /** fetch all bus stops */
  private getBusStops(): void {
    this.busesService.getBusStops().subscribe({
      next: (res) => {
        this.stopItems = res.data.map((stop: Stop) => ({
          ...stop,
          label: `${stop.codParada} --> ${stop.nombreParada}`,
        }));
      },
      error: (err) => {
        console.error('An error occurred while getting bus stops: ', err);
      },
    });
  }

  /**
   * handle change when a line is selected. Filters stops by selected line
   * @param event - event from the select component
   */
  onLineChange(event: any) {
    if (!event.value) {
      this.stopItemsByLine = [];
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
        console.error('An error occurred while getting bus stops by line: ', err);
      },
    });
  }
}
