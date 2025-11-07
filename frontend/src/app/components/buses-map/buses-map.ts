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

import { Line, Stop, Location, Schedule } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';
import { SocketService } from '../../services/socketService.service';

@Component({
  selector: 'app-buses-map',
  imports: [],
  templateUrl: './buses-map.html',
  styleUrl: './buses-map.scss',
})
export class BusesMap implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() line: Line | undefined;
  @Input() busesStopsOfLine: Stop[] | undefined;
  @Input() stop: Stop | undefined;

  private allBuses: Location[] | undefined;
  private lineBuses: Location[] | undefined;

  private map!: L.Map;
  private markers: L.LatLngExpression[] = [
    [36.7215, -4.42493], // Malaga
  ];
  private stopMarkersLayer: L.LayerGroup = L.layerGroup();
  private busesLocationsLayer: L.LayerGroup = L.layerGroup();

  private busStopMarker = L.icon({
    iconUrl: 'assets/icons/BusStop.png',
    iconSize: [35, 35],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
  private busMarkerD1 = L.icon({
    iconUrl: 'assets/icons/Bus.png',
    iconSize: [20, 14],
    iconAnchor: [10, 12],
    popupAnchor: [0, -32],
  });
  private busMarkerD2 = L.icon({
    iconUrl: 'assets/icons/BusSent2.png',
    iconSize: [20, 14],
    iconAnchor: [10, 12],
    popupAnchor: [0, -32],
  });

  private defaultZoom = 14;
  private zoomOnStop = 18;

  private sub!: Subscription;

  constructor(private busesService: BusesService, private socket: SocketService) {}

  ngOnInit() {
    if (!this.line) {
      this.loadAllBuses();
    }

    this.sub = this.socket.refresh.subscribe(() => {
      console.log('Detected new bus locations from backend');
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

    if (changes['stop'] && !changes['line']) {
      if (changes['stop'].currentValue) {
        this.showSingleBusStop();
      } else {
        this.stopMarkersLayer.clearLayers();
        if (this.line) {
          this.addStopMarkers();
        }
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
        const marker = L.marker(stopPos, { icon: this.busStopMarker });
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
        const marker = L.marker(busPos, {
          icon,
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
      error: (err) => console.error('An error ocurred while getting bus locations'),
    });
  }

  private showSingleBusStop() {
    this.stopMarkersLayer.clearLayers();
    const stopPos = L.latLng(this.stop!.lat, this.stop!.lon);
    const marker = L.marker(stopPos, { icon: this.busStopMarker });
    this.map.flyTo(stopPos, this.zoomOnStop);
    this.stopMarkersLayer.addLayer(marker);
    this.stopMarkersLayer.addTo(this.map);
  }
}
