import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import * as L from 'leaflet';
import { Subscription, Observable } from 'rxjs';

import { Line, Stop, Location, InfoStop, Schedule } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';
import { SocketService } from '../../services/socketService.service';

import { SplitterModule } from 'primeng/splitter';
import { CommonModule } from '@angular/common';

import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-buses-map',
  imports: [SplitterModule, CommonModule],
  templateUrl: './buses-map.html',
  styleUrl: './buses-map.scss',
})
export class BusesMap implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() line: Line | undefined;
  @Input() busesStopsOfLine: Stop[] | undefined;
  @Input() stop: Stop | undefined;

  infoStop: InfoStop | undefined;
  private readonly maxSizeInfoStop = 99.999;
  private readonly minSizeInfoStop = 0.001;
  private readonly sizeInfoStop = 19.999;
  private readonly sizeChartLocations = 39.999;
  public panelSizes = [this.minSizeInfoStop, this.maxSizeInfoStop];

  private allBuses: Location[] | undefined;
  private lineBuses: Location[] | undefined;

  private map!: L.Map;
  private markers: L.LatLngExpression[] = [[36.7215, -4.42493]];
  private stopMarkersLayer: L.LayerGroup = L.layerGroup();
  private busesLocationsLayer: L.LayerGroup = L.layerGroup();

  private StopMarker = L.icon({
    iconUrl: 'assets/icons/BusStop.png',
    iconSize: [35, 35],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
  private busMarkerD1 = L.icon({
    iconUrl: 'assets/icons/Bus.png',
    iconSize: [24, 17],
    iconAnchor: [12, 8],
    popupAnchor: [0, -14],
  });
  private busMarkerD2 = L.icon({
    iconUrl: 'assets/icons/BusSent2.png',
    iconSize: [24, 17],
    iconAnchor: [12, 8],
    popupAnchor: [0, -14],
  });

  private defaultZoom = 14;
  private zoomOnStop = 18;

  private sub!: Subscription;

  // Nuevo mapa para guardar ETA precalculadas de la línea 65
  private ETALine: { [codParada: number]: number } = {};

  // Show message last update on map
  private lastUpdateContainer!: HTMLDivElement;
  private lastUpdateTime: string = '';

  private busScatterChart?: Chart;

  constructor(
    private busesService: BusesService,
    private socket: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.line) {
      this.loadAllBuses();
    }

    this.sub = this.socket.refresh.subscribe(() => {
      if (!this.line) {
        this.loadAllBuses();
        this.updateLastUpdateTime();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['line']) {
      this.stopMarkersLayer.clearLayers();
      if (changes['line'].currentValue) {
        this.loadLineBuses();
      } else {
        this.loadAllBuses();
      }
    }

    if (changes['stop'] && changes['stop'].currentValue) {
      this.showSingleBusStop();
      if (this.stop && this.line) {
        this.infoStop = this.getInfoStop(this.stop, [this.line]);
        this.cdr.detectChanges();
      }
    } else if (!changes['stop']?.currentValue) {
      this.infoStop = undefined;
      this.stopMarkersLayer.clearLayers();
      if (this.line) {
        this.addStopMarkers();
      }
    }

    if (changes['busesStopsOfLine'] && changes['busesStopsOfLine'].currentValue) {
      this.addStopMarkers();
      if (this.lineBuses?.length && this.line?.codLinea === 65) {
        this.calculateETA();
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
    this.initLastUpdateBox();
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map');
    L.tileLayer(baseMapURl, {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.addReloadButton();
  }

  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map((marker) => marker));
    this.map.fitBounds(bounds);
    this.map.setZoom(this.defaultZoom);
  }

  private addStopMarkers() {
    if (this.busesStopsOfLine) {
      this.busesStopsOfLine.forEach((stop) => {
        const stopPos = L.latLng(stop.lat, stop.lon);
        const marker = L.marker(stopPos, { icon: this.StopMarker });
        marker.on('click', () => {
          this.onStopClick(stop);
        });

        this.stopMarkersLayer.addLayer(marker);
      });
    }

    if (!this.map.hasLayer(this.stopMarkersLayer)) {
      this.stopMarkersLayer.addTo(this.map);
    }
  }

  private addBusesLocations(buses: Location[] | undefined, layer: L.LayerGroup) {
    if (buses) {
      buses.forEach((bus) => {
        const busPos = L.latLng(bus.lat, bus.lon);
        const icon = bus.sentido === 2 ? this.busMarkerD1 : this.busMarkerD2;
        const marker = L.marker(busPos, { icon });
        marker.on('click', () => {
          this.onBusClick(bus.codBus);
        });
        layer.addLayer(marker);
      });
    }

    if (layer.getLayers().length > 0 && !this.map.hasLayer(layer)) {
      layer.addTo(this.map);
    }
  }

  private loadAllBuses() {
    this.busesService.getBuses().subscribe({
      next: (res) => {
        if (!res.data) throw Error('Buses locations databases does not have values');
        this.allBuses = res.data;
        this.busesLocationsLayer.clearLayers();
        this.addBusesLocations(this.allBuses, this.busesLocationsLayer);
      },
      error: (err) => console.error('Buses locations could not be obtained', err),
    });
  }

  private loadLineBuses() {
    if (!this.line) throw Error('Line data is null');
    this.busesService.getBusesByLine(this.line.codLinea).subscribe({
      next: (res) => {
        if (!res.data) throw Error(`There are no buses for line ${this.line!.codLinea}`);
        this.lineBuses = res.data;
        this.busesLocationsLayer.clearLayers();
        this.addBusesLocations(this.lineBuses, this.busesLocationsLayer);
      },
      error: (err) => console.error('An error ocurred while getting bus locations: ', err),
    });
  }

  private showSingleBusStop() {
    this.stopMarkersLayer.clearLayers();
    const stopPos = L.latLng(this.stop!.lat, this.stop!.lon);
    const marker = L.marker(stopPos, { icon: this.StopMarker });
    this.map.flyTo(stopPos, this.zoomOnStop);
    marker.on('click', () => {
      this.onStopClick(this.stop!);
    });
    this.stopMarkersLayer.addLayer(marker);
    this.stopMarkersLayer.addTo(this.map);
  }

  private getInfoStop(
    stop: Stop,
    linesOfStop: { codLinea: number; nombreLinea: string }[],
    nextArrivals?: { lineCode: number; estimatedTime: number }[]
  ): InfoStop {
    return {
      stopName: stop.nombreParada,
      stopCode: stop.codParada,
      arrivalLines: linesOfStop.map((line) => ({
        lineCode: line.codLinea,
        lineName: line.nombreLinea,
      })),
      nextArrivals: nextArrivals,
    };
  }

  private calculateETA() {
    const lineId = 65;
    if (!this.busesStopsOfLine || !this.lineBuses) return;

    this.busesService.getBusStopsOrdered(lineId).subscribe({
      next: (res) => {
        if (!res.data) throw Error('No order of stops were found for that line');

        const stops: Stop[] = res.data.map(
          (schedule: Schedule) =>
            this.busesStopsOfLine!.find((s) => s.codParada === schedule.codParada)!
        );

        if (stops.length < 2) return;

        const disanceBetweenStops = this.computeStopDistances(stops);
        const estimatedTimes: number[] = Array(stops.length).fill(Number.MAX_VALUE);
        const buses = this.lineBuses!;
        if (buses.length === 0) return;

        // km/h
        const avgSpeed = 35;
        for (const bus of buses) {
          const [minDistance, nearestIndex] = this.findNearestBusStop(stops, bus.lat, bus.lon);
          this.ETAToBusStops(
            stops,
            estimatedTimes,
            disanceBetweenStops,
            minDistance,
            nearestIndex,
            avgSpeed
          );
        }

        // Save ETA for each bus stop
        this.ETALine = {};
        stops.forEach((s, i) => {
          if (estimatedTimes[i] !== Number.MAX_VALUE) {
            this.ETALine[s.codParada] = parseFloat(estimatedTimes[i].toFixed(1));
          }
        });
      },
      error: (err) => console.error('Error obteniendo paradas ordenadas línea 65', err),
    });
  }

  private ETAToBusStops(
    stops: Stop[],
    estimatedTimes: number[],
    disanceBetweenStops: number[],
    minBusDistance: number,
    nearestIdx: number,
    avgSpeed: number
  ) {
    // minutes
    let accumulatedTime = (minBusDistance / avgSpeed) * 60;

    for (let i = 0; i < stops.length; i++) {
      const idx = (nearestIdx + i) % stops.length;
      if (accumulatedTime < estimatedTimes[idx]) {
        estimatedTimes[idx] = accumulatedTime;
      }
      accumulatedTime += (disanceBetweenStops[idx] / avgSpeed) * 60;
    }
  }

  private findNearestBusStop(stops: Stop[], busLat: number, busLon: number): [number, number] {
    let nearestIndex = 0;
    let minDistance = Number.MAX_VALUE;
    // Search nearest bus stop
    for (let i = 0; i < stops.length; i++) {
      const d = this.calculateDistance(busLat, busLon, stops[i].lat, stops[i].lon);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }

    return [minDistance, nearestIndex];
  }

  // Calculate distance between stops
  private computeStopDistances(stops: Stop[]): number[] {
    const distances: number[] = [];
    for (let i = 0; i < stops.length; i++) {
      const idxPlus1 = (i + 1) % stops.length;
      const dist = this.calculateDistance(
        stops[i].lat,
        stops[i].lon,
        stops[idxPlus1].lat,
        stops[idxPlus1].lon
      );
      distances.push(dist);
    }
    return distances;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private onStopClick(stop: Stop) {
    this.stop = stop;

    this.busesService.getLinesAtStop(stop.codParada).subscribe({
      next: (res) => {
        const lines = res.data;
        let nextArrivals: { lineCode: number; estimatedTime: number }[] | undefined;

        // Solo agregar ETA precalculada si es línea 65
        if (this.line?.codLinea === 65 && this.ETALine[stop.codParada] != null) {
          nextArrivals = [{ lineCode: 65, estimatedTime: this.ETALine[stop.codParada] }];
        }

        this.infoStop = this.getInfoStop(stop, lines, nextArrivals);
        this.panelSizes = [this.sizeInfoStop, this.maxSizeInfoStop - this.sizeInfoStop];
        this.cdr.detectChanges();

        this.showSingleBusStop();
        const stopPos = L.latLng(stop.lat, stop.lon);
        this.map.flyTo(stopPos, this.zoomOnStop);
      },
      error: (err) => console.error('Finding lines at stop went wrong', err),
    });
  }

  public closeInfoPanel() {
    this.infoStop = undefined;
    this.busScatterChart?.destroy();
    this.panelSizes = [this.minSizeInfoStop, this.maxSizeInfoStop];
    this.stopMarkersLayer.clearLayers();
    if (this.line && this.busesStopsOfLine) {
      this.addStopMarkers();
    }
  }

  public forceReloadLocations() {
    this.busesService.forceReloadBusLocations().subscribe({
      next: (res) => {
        this.line ? this.loadLineBuses() : this.loadAllBuses();
        this.loadAllBuses();
        this.updateLastUpdateTime();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error while forcing reload busData', err);
      },
    });
  }

  private addReloadButton() {
    const reloadControl = L.Control.extend({
      options: { position: 'topleft' },

      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control leaflet-control-custom'
        );

        container.style.backgroundColor = 'white';
        container.style.width = '34px';
        container.style.height = '30px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.cursor = 'pointer';
        container.style.color = 'black';
        container.style.fontSize = '18px';
        container.title = 'Reload buses locations';
        container.innerHTML = '⟳';

        container.onclick = () => {
          this.forceReloadLocations();
        };

        // Evitar que el clic se propague al mapa
        L.DomEvent.disableClickPropagation(container);
        return container;
      },
    });

    this.map.addControl(new reloadControl());
  }

  trackByLineCode(index: number, line: { lineCode: number }) {
    return line.lineCode;
  }

  getEstimatedTime(lineCode: number): string {
    if (!this.infoStop?.nextArrivals) return '--';
    const arrival = this.infoStop.nextArrivals.find((a) => a.lineCode === lineCode);
    return arrival ? arrival.estimatedTime.toFixed(0) + ' min' : '--';
  }

  private initLastUpdateBox() {
    const LastUpdateControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: (map: L.Map) => {
        this.lastUpdateContainer = L.DomUtil.create('div', 'last-update-control');
        this.lastUpdateContainer.style.backgroundColor = 'white';
        this.lastUpdateContainer.style.padding = '6px 10px';
        this.lastUpdateContainer.style.fontSize = '13px';
        this.lastUpdateContainer.style.fontWeight = 'bold';
        this.lastUpdateContainer.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
        L.DomEvent.disableClickPropagation(this.lastUpdateContainer);

        this.updateLastUpdateTime(); // Inicializamos con la hora actual
        return this.lastUpdateContainer;
      },
    });

    this.map.addControl(new LastUpdateControl());
  }

  private updateLastUpdateTime() {
    this.lastUpdateTime = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (this.lastUpdateContainer) {
      this.lastUpdateContainer.innerHTML = `Last update:<br>${this.lastUpdateTime}`;
    }
  }

  private onBusClick(busId: number) {
    this.infoStop = undefined;
    this.busesService.getBusLocationsLog(busId).subscribe({
      next: (res) => {
        if (!res.data) throw Error('No logs for that bus selected were found');

        const busPositions = res.data.map((bus: Location) => ({
          x: bus.lon,
          y: bus.lat,
        }));
        this.cdr.detectChanges();
        this.panelSizes = [this.sizeChartLocations, this.maxSizeInfoStop - this.sizeChartLocations];
        this.cdr.detectChanges();

        this.generateChartLocations(busPositions, res.data[0].codLinea);
      },
      error: (err) => {
        console.error('Error while getting bus locations logs: ', err);
      },
    });
  }

  private generateChartLocations(busPositions: { x: number; y: number }[], lineCode: number) {
    const canvasBusLocationsLog = document.getElementById(
      'bus-locations-logs'
    ) as HTMLCanvasElement;
    if (!canvasBusLocationsLog) {
      throw Error('No canvas was found to show bus locations');
    }

    if (this.busScatterChart) {
      this.busScatterChart.destroy();
    }

    this.busScatterChart = new Chart(canvasBusLocationsLog, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: `Bus positions for line ${lineCode}`,
            data: busPositions,
            backgroundColor: '#3b82f6',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Bus GPS Locations (Lat vs Lon) - Line ${lineCode}`,
            color: '#1f2937',
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            labels: { color: '#1f2937' },
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Longitude (lon)',
              color: '#1f2937',
            },
            ticks: { color: '#1f2937' },
          },
          y: {
            title: {
              display: true,
              text: 'Latitude (lat)',
              color: '#1f2937',
            },
            ticks: { color: '#1f2937' },
          },
        },
      },
    });
  }
}
