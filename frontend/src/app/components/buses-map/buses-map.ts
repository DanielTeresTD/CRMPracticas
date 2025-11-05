import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

import { Line, Stop, Location } from '../../interfaces/buses';
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

  private busesOfLine: Location[] | undefined;

  private map!: L.Map;
  private markers: L.LatLngExpression[] = [
    [36.7215, -4.42493], // Malaga
  ];
  private stopMarkersLayer: L.LayerGroup = L.layerGroup();
  private busStopMarker = L.icon({
    iconUrl: 'assets/icons/BusStop.png',

    iconSize: [25, 40],
    iconAnchor: [13, 39], // Where icon will be displayed in the marker
    popupAnchor: [0, -32], // relative icon anchor
  });

  constructor(private busesService: BusesService) {}

  ngOnInit() {}

  // Changes is an object with each key equals to input atr.
  // If new value is passed to input, it will update that values
  ngOnChanges(changes: SimpleChanges) {
    if (changes['line']) {
      if (changes['line'].currentValue) {
        this.getBusByLine();
      } else {
        this.stopMarkersLayer.clearLayers();
      }
    }

    if (changes['busesStopsOfLine'] && changes['busesStopsOfLine'].currentValue) {
      this.addStopMarkers();
    }
  }

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
    //this.addMarkers();
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
    this.map.setZoom(14);
  }

  private addStopMarkers() {
    // Clear bus stops icons
    this.stopMarkersLayer.clearLayers();

    // Add buses stops of specific line
    if (this.busesStopsOfLine) {
      this.busesStopsOfLine.forEach((stop) => {
        const marker = L.marker([stop.lat, stop.lon]);
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
}
