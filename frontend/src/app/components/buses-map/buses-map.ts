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
import { Subscription } from 'rxjs';

import { Line, Stop, Location, InfoStop, Schedule } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';
import { SocketService } from '../../services/socketService.service';

import { SplitterModule } from 'primeng/splitter';
import { CommonModule } from '@angular/common';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-buses-map',
  imports: [SplitterModule, CommonModule],
  templateUrl: './buses-map.html',
  styleUrl: './buses-map.scss',
})
export class BusesMap implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  /** Line selected from the parent component selector */
  @Input() line: Line | undefined;

  /** Stops of the selected line */
  @Input() busesStopsOfLine: Stop[] | undefined;

  /** Single stop selected on the parent component selector */
  @Input() stop: Stop | undefined;

  /** Stores the info of a stop when clicked */
  infoStop: InfoStop | undefined;

  /** Split panel sizes */
  private readonly maxSizeInfoStop = 99.999;
  private readonly minSizeInfoStop = 0.001;
  private readonly sizeInfoStop = 19.999;
  private readonly sizeChartLocations = 39.999;
  public panelSizes = [this.minSizeInfoStop, this.maxSizeInfoStop];

  /** All active buses in the system */
  private allBuses: Location[] | undefined;

  /** Buses belonging to current selected line */
  private lineBuses: Location[] | undefined;

  /** Leaflet map instance */
  private map!: L.Map;

  /** Default map markers */
  private markers: L.LatLngExpression[] = [[36.7215, -4.42493]];

  /** Layer for buses stops markers */
  private stopMarkersLayer: L.LayerGroup = L.layerGroup();

  /** Layer for buses markers */
  private busesLocationsLayer: L.LayerGroup = L.layerGroup();

  /** Custom icons */
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

  /** Default map zoom levels */
  private defaultZoom = 14;
  private zoomOnStop = 18;

  /** WebSocket subscription */
  private sub!: Subscription;

  /** Estimated time arrival (ETA) for line 65 indexed by stop code */
  private ETALine: { [codParada: number]: number } = {};

  /** Ordered ETA list displayed under the bus chart */
  public orderedStopsETA: { stop: Stop; eta: number }[] = [];

  /** Whether to show the ETA list below the chart */
  public showStopsETAUnderChart = false;

  /** Last update time UI element */
  private lastUpdateContainer!: HTMLDivElement;

  /** Last update time text */
  private lastUpdateTime: string = '';

  /** Chart.js instance */
  private busScatterChart?: Chart;

  constructor(
    private busesService: BusesService,
    private socket: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  /** @inheritdoc */
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

  /**
   * Triggered when @Input properties change
   * @param changes - Object containing the input changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['line']) {
      this.stopMarkersLayer.clearLayers();

      if (changes['line'].currentValue) {
        this.loadLineBuses();
      } else {
        if (this.infoStop || this.busScatterChart) this.closeInfoPanel();
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
      if (this.line) this.addStopMarkers();
    }

    if (changes['busesStopsOfLine'] && changes['busesStopsOfLine'].currentValue) {
      this.addStopMarkers();
      if (this.lineBuses?.length && this.line?.codLinea === 65) {
        this.calculateETA();
      }
    }
  }

  /** @inheritdoc */
  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
    this.initLastUpdateBox();
  }

  /** @inheritdoc */
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  /**
   * Initializes the Leaflet map
   * @private
   */
  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map');

    L.tileLayer(baseMapURl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.addReloadButton();
  }

  /** Centers the map automatically */
  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map((marker) => marker));
    this.map.fitBounds(bounds);
    this.map.setZoom(this.defaultZoom);
  }

  /**
   * Adds stop markers into the map
   * @private
   */
  private addStopMarkers() {
    if (this.busesStopsOfLine) {
      this.busesStopsOfLine.forEach((stop) => {
        const pos = L.latLng(stop.lat, stop.lon);
        const marker = L.marker(pos, { icon: this.StopMarker });
        // Set callback function when marker is clicked
        marker.on('click', () => this.onStopClick(stop));
        this.stopMarkersLayer.addLayer(marker);
      });
    }

    if (!this.map.hasLayer(this.stopMarkersLayer)) {
      this.stopMarkersLayer.addTo(this.map);
    }
  }

  /**
   * Adds bus markers to a given layer
   *
   * @param buses - List of buses among with it´s locations
   * @param layer - Layer group to append bus markers
   */
  private addBusesLocations(buses: Location[] | undefined, layer: L.LayerGroup) {
    if (buses) {
      buses.forEach((bus) => {
        const pos = L.latLng(bus.lat, bus.lon);
        const icon = bus.sentido === 2 ? this.busMarkerD1 : this.busMarkerD2;
        const marker = L.marker(pos, { icon });
        marker.on('click', () => this.onBusClick(bus.codBus));
        layer.addLayer(marker);
      });
    }

    if (layer.getLayers().length > 0 && !this.map.hasLayer(layer)) {
      this.map.addLayer(layer);
    }
  }

  /** Loads all buses in Málaga */
  private loadAllBuses() {
    this.busesService.getBuses().subscribe({
      next: (res) => {
        this.allBuses = res.data;
        this.busesLocationsLayer.clearLayers();
        this.addBusesLocations(this.allBuses, this.busesLocationsLayer);
      },
      error: (err) => console.error('Error getting buses', err),
    });
  }

  /** Loads buses of the selected line */
  private loadLineBuses() {
    if (!this.line) throw Error('Line null');

    this.busesService.getBusesByLine(this.line.codLinea).subscribe({
      next: (res) => {
        this.lineBuses = res.data;
        this.busesLocationsLayer.clearLayers();
        this.addBusesLocations(this.lineBuses, this.busesLocationsLayer);
      },
      error: (err) => console.error(err),
    });
  }

  /** Displays only the selected stop on the map */
  private showSingleBusStop() {
    this.stopMarkersLayer.clearLayers();
    const p = L.latLng(this.stop!.lat, this.stop!.lon);

    const marker = L.marker(p, { icon: this.StopMarker });
    marker.on('click', () => this.onStopClick(this.stop!));

    this.stopMarkersLayer.addLayer(marker);
    this.map.addLayer(this.stopMarkersLayer);

    this.map.flyTo(p, this.zoomOnStop);
  }

  /**
   * Constructs an InfoStop object
   *
   * @param stop - The selected stop
   * @param linesOfStop - Lines that serve this stop
   * @param nextArrivals - ETA info (optional)
   * @returns InfoStop object to display on the panel
   */
  private getInfoStop(
    stop: Stop,
    linesOfStop: { codLinea: number; nombreLinea: string }[],
    nextArrivals?: any
  ): InfoStop {
    return {
      stopName: stop.nombreParada,
      stopCode: stop.codParada,
      arrivalLines: linesOfStop.map((line) => ({
        lineCode: line.codLinea,
        lineName: line.nombreLinea,
      })),
      nextArrivals,
    };
  }

  /**
   * Calculates ETA and stores in ETALine
   *
   * @remarks
   * Actually, only applies to line **65**.
   */
  private calculateETA() {
    // Force only work with line 65
    const lineId = 65;
    if (!this.busesStopsOfLine || !this.lineBuses) return;

    this.busesService.getBusStopsOrdered(lineId).subscribe({
      next: (res) => {
        const stops: Stop[] = res.data.map(
          (s: Schedule) => this.busesStopsOfLine!.find((st) => st.codParada === s.codParada)!
        );

        if (stops.length < 2) return;

        const distances = this.computeStopDistances(stops);
        const estimated: number[] = Array(stops.length).fill(Number.MAX_VALUE);
        const buses = this.lineBuses!;
        if (buses.length === 0) return;

        // Avg speed of bus to this specific line
        const avgSpeed = 35;

        for (const bus of buses) {
          const [minD, nearestIdx] = this.findNearestBusStop(stops, bus.lat, bus.lon);
          this.ETAToBusStops(stops, estimated, distances, minD, nearestIdx, avgSpeed);
        }

        this.ETALine = {};
        stops.forEach((stop, i) => {
          if (estimated[i] !== Number.MAX_VALUE) {
            this.ETALine[stop.codParada] = parseFloat(estimated[i].toFixed(1));
          }
        });
      },
      error: (err) => console.error('ETA error', err),
    });
  }
  /**
   * Builds a list of ordered stops with their calculated ETA for the given line.
   *
   * @remarks
   * This method:
   *  - Fetches stops ordered for the specified line from backend.
   *  - Maps them to the in-memory stop objects (`busesStopsOfLine`).
   *  - Generates `orderedStopsETA` combining the stop info + ETA already calculated in `ETALine`.
   *  - Does NOT recalculate ETA — it only assembles the display list.
   *
   * @param lineId - Unique identifier of the bus line
   */
  private buildOrderedStopsETA(lineId: number): void {
    // reset previous list
    this.orderedStopsETA = [];

    if (!this.busesStopsOfLine) return;

    this.busesService.getBusStopsOrdered(lineId).subscribe({
      next: (res) => {
        // Ordered stops but mapped to local Stop objects
        const orderedStops: Stop[] = res.data.map(
          (s: Schedule) => this.busesStopsOfLine!.find((st) => st.codParada === s.codParada)!
        );

        // Build the list that UI uses under the chart
        this.orderedStopsETA = orderedStops.map((stop) => ({
          stop,
          eta: this.ETALine[stop.codParada] ?? -1, // -1 means no ETA available
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error building ETA list', err),
    });
  }

  /**
   * Computes ETA propagation stop by stop
   *
   * @param stops - Ordered stops
   * @param estimated - ETA array to update
   * @param distances - Distances stop-to-stop
   * @param minD - Distance from bus to nearest stop
   * @param nearestIdx - Index of nearest stop
   * @param avgSpeed - Average bus speed (km/h)
   */
  private ETAToBusStops(
    stops: Stop[],
    estimated: number[],
    distances: number[],
    minD: number,
    nearestIdx: number,
    avgSpeed: number
  ) {
    let acc = (minD / avgSpeed) * 60;

    for (let i = 0; i < stops.length; i++) {
      const idx = (nearestIdx + i) % stops.length;
      if (acc < estimated[idx]) estimated[idx] = acc;
      acc += (distances[idx] / avgSpeed) * 60;
    }
  }

  /**
   * Finds closest stop to a given bus
   *
   * @param stops - Stops list
   * @param busLat - Bus latitude
   * @param busLon - Bus longitude
   * @returns Tuple [distance, index]
   */
  private findNearestBusStop(stops: Stop[], busLat: number, busLon: number): [number, number] {
    let min = Number.MAX_VALUE;
    let idx = 0;

    for (let i = 0; i < stops.length; i++) {
      const d = this.calculateDistance(busLat, busLon, stops[i].lat, stops[i].lon);
      if (d < min) {
        min = d;
        idx = i;
      }
    }

    return [min, idx];
  }

  /**
   * Computes distances between consecutive stops
   * @param stops - Ordered stops
   * @returns Distance array
   */
  private computeStopDistances(stops: Stop[]): number[] {
    const distances: number[] = [];
    for (let i = 0; i < stops.length; i++) {
      const j = (i + 1) % stops.length;
      distances.push(
        this.calculateDistance(stops[i].lat, stops[i].lon, stops[j].lat, stops[j].lon)
      );
    }
    return distances;
  }

  /**
   * Haversine distance
   *
   * @param lat1 - Latitude A
   * @param lon1 - Longitude A
   * @param lat2 - Latitude B
   * @param lon2 - Longitude B
   * @returns Distance in km
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** Degrees to radians */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Handles clicking on a stop marker. Then shows on the left panel the info
   * of lines that arrives to this stops and ETA for each line to this stop.
   *
   * @param stop - Selected stop
   */
  private onStopClick(stop: Stop) {
    this.stop = stop;
    this.showStopsETAUnderChart = false;

    this.busesService.getLinesAtStop(stop.codParada).subscribe({
      next: (res) => {
        const lines = res.data;
        let nextArrivals;

        // Only allows calculate ETA when line selected is 65
        if (this.line?.codLinea === 65 && this.ETALine[stop.codParada] != null) {
          nextArrivals = [{ lineCode: 65, estimatedTime: this.ETALine[stop.codParada] }];
        }

        this.infoStop = this.getInfoStop(stop, lines, nextArrivals);
        this.panelSizes = [this.sizeInfoStop, this.maxSizeInfoStop - this.sizeInfoStop];
        this.cdr.detectChanges();

        this.showSingleBusStop();
      },
      error: (err) => console.error(err),
    });
  }

  /**
   * Handles clicking on a bus marker. It shows on left panel the chart and
   * ETA to arrive at each stop of the route.
   *
   * @param busId - Selected bus ID
   */
  private onBusClick(busId: number) {
    this.infoStop = undefined;
    this.showStopsETAUnderChart = false;

    this.busesService.getBusLocationsLog(busId).subscribe({
      next: (res) => {
        const busPositions = res.data.map((bus: Location) => ({
          x: bus.lon,
          y: bus.lat,
        }));

        this.cdr.detectChanges();
        this.panelSizes = [this.sizeChartLocations, this.maxSizeInfoStop - this.sizeChartLocations];
        this.cdr.detectChanges();

        this.generateChartLocations(busPositions, res.data[0].codLinea);

        if (this.line?.codLinea === 65) {
          this.buildOrderedStopsETA(65);
          this.showStopsETAUnderChart = true;
        }
      },
      error: (err) => console.error('Error logs: ', err),
    });
  }

  /**
   * Generates the scatter plot for bus GPS history
   *
   * @param busPositions - Points to plot
   * @param lineCode - Related bus line
   */
  private generateChartLocations(busPositions: { x: number; y: number }[], lineCode: number) {
    const canvas = document.getElementById('bus-locations-logs') as HTMLCanvasElement;
    if (!canvas) throw Error('Canvas not found');

    if (this.busScatterChart) this.busScatterChart.destroy();

    this.busScatterChart = new Chart(canvas, {
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
          legend: { labels: { color: '#1f2937' } },
          datalabels: { display: false },
        },
        scales: {
          x: {
            title: { display: true, text: 'Longitude (lon)', color: '#1f2937' },
            ticks: { color: '#1f2937' },
          },
          y: {
            title: { display: true, text: 'Latitude (lat)', color: '#1f2937' },
            ticks: { color: '#1f2937' },
          },
        },
      },
    });
  }

  /** Closes the left side panel and resets UI */
  public closeInfoPanel() {
    this.infoStop = undefined;
    this.busScatterChart?.destroy();
    this.orderedStopsETA = [];
    this.showStopsETAUnderChart = false;

    this.panelSizes = [this.minSizeInfoStop, this.maxSizeInfoStop];

    this.stopMarkersLayer.clearLayers();
    if (this.line && this.busesStopsOfLine) {
      this.addStopMarkers();
    }
  }

  /** Forces reload of bus locations */
  public forceReloadLocations() {
    this.busesService.forceReloadBusLocations().subscribe({
      next: () => {
        this.line ? this.loadLineBuses() : this.loadAllBuses();
        this.updateLastUpdateTime();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  /** Adds UI button to force reload buses locations */
  private addReloadButton() {
    const reloadControl = L.Control.extend({
      options: { position: 'topleft' },

      onAdd: () => {
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
        container.style.fontSize = '18px';
        container.innerHTML = '⟳';
        container.title = 'Reload buses locations';

        container.onclick = () => this.forceReloadLocations();

        L.DomEvent.disableClickPropagation(container);
        return container;
      },
    });

    this.map.addControl(new reloadControl());
  }

  /** Initializes UI element showing last update time of buses locations */
  private initLastUpdateBox() {
    const LastUpdateControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        this.lastUpdateContainer = L.DomUtil.create('div', 'last-update-control');
        this.lastUpdateContainer.style.backgroundColor = 'white';
        this.lastUpdateContainer.style.padding = '6px 10px';
        this.lastUpdateContainer.style.fontSize = '13px';
        this.lastUpdateContainer.style.fontWeight = 'bold';
        this.lastUpdateContainer.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';

        this.updateLastUpdateTime();
        return this.lastUpdateContainer;
      },
    });

    this.map.addControl(new LastUpdateControl());
  }

  /** Updates last update time printed on the top right side of the map */
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

  /**
   * Returns ETA string for a specific line at a stop
   * @param lineCode - Line code
   * @returns ETA string or '--'
   */
  getEstimatedTime(lineCode: number): string {
    if (!this.infoStop?.nextArrivals) return '--';
    const arrival = this.infoStop.nextArrivals.find((a) => a.lineCode === lineCode);
    return arrival ? arrival.estimatedTime.toFixed(0) + ' min' : '--';
  }
}
