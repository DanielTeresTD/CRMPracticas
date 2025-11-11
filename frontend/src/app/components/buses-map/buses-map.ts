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

import { Line, Stop, Location, InfoStop } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';
import { SocketService } from '../../services/socketService.service';

import { SplitterModule } from 'primeng/splitter';
import { CommonModule } from '@angular/common';

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
    iconAnchor: [12, 13],
    popupAnchor: [0, -14],
  });
  private busMarkerD2 = L.icon({
    iconUrl: 'assets/icons/BusSent2.png',
    iconSize: [24, 17],
    iconAnchor: [12, 13],
    popupAnchor: [0, -14],
  });

  private defaultZoom = 14;
  private zoomOnStop = 18;

  private sub!: Subscription;

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
      if (!this.line) this.loadAllBuses();
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
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
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
        const icon = bus.sentido === 1 ? this.busMarkerD1 : this.busMarkerD2;
        const marker = L.marker(busPos, { icon });
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
      error: (err) => console.error('An error ocurred while getting bus locations'),
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
    linesOfStop: { codLinea: number; nombreLinea: string }[]
  ): InfoStop {
    return {
      stopName: stop.nombreParada,
      stopCode: stop.codParada,
      arrivalLines: linesOfStop.map((line) => ({
        lineCode: line.codLinea,
        lineName: line.nombreLinea,
      })),
      nextArrivals: undefined,
    };
  }

  private onStopClick(stop: Stop) {
    this.stop = stop; // actualiza la parada seleccionada

    this.busesService.getLinesAtStop(stop.codParada).subscribe({
      next: (res) => {
        const lines = res.data; // debería ser un array de { codLinea, nombreLinea }

        this.infoStop = this.getInfoStop(stop, lines);
        this.panelSizes = [this.sizeInfoStop, this.maxSizeInfoStop - this.sizeInfoStop];
        this.cdr.detectChanges();

        this.showSingleBusStop(); // muestra solo esa parada
        const stopPos = L.latLng(stop.lat, stop.lon);
        this.map.flyTo(stopPos, this.zoomOnStop);
      },
      error: (err) => {
        console.error('Finding lines at stop went wrong', err);
      },
    });
  }

  public closeInfoPanel() {
    this.infoStop = undefined;
    this.panelSizes = [this.minSizeInfoStop, this.maxSizeInfoStop];
  }

  public forceReloadLocations() {
    this.busesService.forceReloadBusLocations().subscribe({
      next: (res) => {
        this.line ? this.loadLineBuses() : this.loadAllBuses();
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
}
