import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

import { Line, Stop, Location, Schedule } from '../../interfaces/buses';
import { BusesService } from '../../services/buses.service';

@Component({
  selector: 'app-buses-map',
  imports: [],
  templateUrl: './buses-map.html',
  styleUrl: './buses-map.scss',
})
export class BusesMap implements OnInit, AfterViewInit, OnChanges {
  @Input() line: Line | undefined;
  @Input() busesStopsOfLine: Stop[] | undefined;
  @Input() stop: Stop | undefined;

  private busesOfLine: Location[] | undefined;

  private map!: L.Map;
  private markers: L.LatLngExpression[] = [
    [36.7215, -4.42493], // Malaga
  ];
  private stopMarkersLayer: L.LayerGroup = L.layerGroup();
  private busRouteLayer: L.LayerGroup = L.layerGroup();
  private busStopMarker = L.icon({
    iconUrl: 'assets/icons/BusStop.png',

    iconSize: [35, 35],
    iconAnchor: [17, 34], // Where icon will be displayed in the marker
    popupAnchor: [0, -32], // relative icon anchor
  });
  private defaultZoom = 14;
  private zoomOnStop = 18;

  constructor(private busesService: BusesService) {}

  ngOnInit() {}

  // Changes is an object with each key equals to input atr.
  // If new value is passed to input, it will update that values
  ngOnChanges(changes: SimpleChanges) {
    if (changes['line']) {
      if (changes['line'].currentValue) {
        // Clear bus stops icons
        this.stopMarkersLayer.clearLayers();
        this.getBusByLine();
      } else {
        this.stopMarkersLayer.clearLayers();
      }
    }

    if (changes['stop'] && !changes['line']) {
      if (changes['stop'].currentValue) {
        this.showSingleBusStop();
      } else {
        this.stopMarkersLayer.clearLayers();
      }
    }

    if (changes['busesStopsOfLine'] && changes['busesStopsOfLine'].currentValue) {
      this.loadRouteOfLine();
      this.addStopMarkers();
    }
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
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(this.markers.map((marker) => marker));

    // Fit the map into the boundary
    this.map.fitBounds(bounds);
    this.map.setZoom(this.defaultZoom);
  }

  private loadRouteOfLine() {
    this.busesService.getBusStopsOrdered(this.line!.codLinea).subscribe({
      next: (res) => {
        const codBusStopsOrdered: number[] = res.data.map((item: Schedule) => item.codParada);
        const vertexRoute: Array<L.LatLng> = [];
        const visitedStops = new Set<number>(); // ← Para evitar duplicados

        if (!this.busesStopsOfLine?.length) {
          console.warn('❗ busesStopsOfLine está vacío o indefinido');
          return;
        }

        // Recorremos las paradas ordenadas y filtramos duplicadas
        codBusStopsOrdered.forEach((codParada) => {
          if (visitedStops.has(codParada)) {
            return; // Ya la procesamos, la saltamos
          }
          visitedStops.add(codParada);

          const stop = this.busesStopsOfLine!.find((s) => s.codParada === codParada);
          if (stop) {
            vertexRoute.push(L.latLng(stop.lat, stop.lon));
          }
        });

        // Dibujar la ruta en el mapa
        const routePolyline = L.polyline(vertexRoute, {
          color: 'blue',
          weight: 3,
          opacity: 0.7,
        });
        this.stopMarkersLayer.addLayer(routePolyline);

        // Ajustar el zoom al recorrido
        if (vertexRoute.length > 0) {
          this.map.fitBounds(routePolyline.getBounds());
        }

        console.log(`✅ Ruta dibujada con ${vertexRoute.length} paradas únicas`);
      },
      error: (err) => {
        console.error('Error while getting bus stops ordered:', err);
      },
    });
  }

  private addStopMarkers() {
    // Add buses stops of specific line
    if (this.busesStopsOfLine) {
      this.busesStopsOfLine.forEach((stop) => {
        const stopPos = L.latLng(stop.lat, stop.lon);
        const marker = L.marker(stopPos, { icon: this.busStopMarker });
        this.stopMarkersLayer.addLayer(marker);
      });
    }

    // Add the bus stops into the map
    if (!this.map.hasLayer(this.stopMarkersLayer)) {
      this.stopMarkersLayer.addTo(this.map);
    }
  }

  private getBusByLine() {
    if (!this.line) {
      throw Error('Line data is null');
    }

    this.busesService.getBusesByLine(this.line.codLinea).subscribe({
      next: (res) => {
        if (!res.data) {
          throw Error(`There are no buses for line ${this.line!.codLinea}`);
        }

        this.busesOfLine = res.data;
      },
      error: (err) => {
        console.error('An error ocurred while getting bus locations');
      },
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
