import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import type {
  Map as LeafletMap,
  TileLayer,
} from 'leaflet';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',

  /*
   * Leaflet genera elementos fuera de las plantillas Angular.
   * Los estilos propios están limitados a .location-section.
   */
  encapsulation: ViewEncapsulation.None,
})
export class Location implements OnDestroy {
  @ViewChild('mapCanvas', { static: true })
  private mapCanvas!: ElementRef<HTMLDivElement>;

  private readonly zone = inject(NgZone);

  private map: LeafletMap | null = null;
  private tiles: TileLayer | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private destroyed = false;

  readonly mapsUrl =
    'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';

  readonly mapStatus =
    signal<'loading' | 'ready' | 'error'>('loading');

  // Destino obtenido del enlace que proporcionaste.
  private readonly latitude = 20.1705166;
  private readonly longitude = -90.1379765;

  private readonly tileUrl =
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  readonly schedules = [
    {
      day: 'Lunes a viernes',
      hours: [
        '8:30 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.',
      ],
    },
    {
      day: 'Sábado',
      hours: [
        '9:00 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.',
      ],
    },
  ];

  constructor() {
    /*
     * Se ejecuta únicamente en el navegador.
     * Leaflet se importa aquí para evitar errores durante SSR.
     */
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        void this.initializeMap();
      });
    });
  }

  private async initializeMap(): Promise<void> {
    try {
      const L = await import('leaflet');

      if (this.destroyed) {
        return;
      }

      const container = this.mapCanvas.nativeElement;

      this.map = L.map(container, {
        center: [this.latitude, this.longitude],
        zoom: 17,

        zoomControl: false,
        attributionControl: false,

        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,

        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });

      this.tiles = L.tileLayer(this.tileUrl, {
        maxZoom: 19,
      });

      this.tiles.on('tileload', this.onTileLoaded);
      this.tiles.on('tileerror', this.onTileError);

      this.tiles.addTo(this.map);

      /*
       * Marcador real anclado a las coordenadas.
       * No es una imagen colocada arbitrariamente sobre el mapa.
       */
      const markerContent = this.createMarkerContent();

      const logoIcon = L.divIcon({
        className: 'janer-map-icon',
        html: markerContent,

        iconSize: [100, 100],
        iconAnchor: [50, 50],
      });

      L.marker(
        [this.latitude, this.longitude],
        {
          icon: logoIcon,
          interactive: false,
          keyboard: false,
        },
      ).addTo(this.map);

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.destroyed || !this.map) {
            return;
          }

          this.map.invalidateSize({
            animate: false,
            pan: false,
          });

          // Conserva el mismo centro al cambiar de dispositivo.
          this.map.setView(
            [this.latitude, this.longitude],
            17,
            { animate: false },
          );
        });

        this.resizeObserver.observe(container);
      }

      this.map.invalidateSize({
        animate: false,
        pan: false,
      });
    } catch (error) {
      if (this.destroyed) {
        return;
      }

      this.zone.run(() => {
        this.mapStatus.set('error');
      });

      console.error(
        '[JANERDent] No se pudo cargar el mapa.',
        error,
      );
    }
  }

  private createMarkerContent(): HTMLDivElement {
    const pin = document.createElement('div');
    pin.className = 'janer-map-pin';

    const logoContainer = document.createElement('div');
    logoContainer.className = 'janer-map-logo';

    const image = document.createElement('img');
    image.src = '/assets/hero/janerdent-logo.webp';
    image.alt = 'JANERDent';
    image.width = 66;
    image.height = 66;
    image.draggable = false;

    logoContainer.appendChild(image);

    const label = document.createElement('div');
    label.className = 'janer-map-label';

    const name = document.createElement('strong');
    name.textContent = 'JANERDent';

    const description = document.createElement('span');
    description.textContent = 'Odontología integral';

    label.append(name, description);
    pin.append(logoContainer, label);

    return pin;
  }

  private readonly onTileLoaded = (): void => {
    if (this.destroyed) {
      return;
    }

    if (this.mapStatus() !== 'ready') {
      this.zone.run(() => {
        this.mapStatus.set('ready');
      });
    }
  };

  private readonly onTileError = (): void => {
    if (this.destroyed || this.mapStatus() === 'ready') {
      return;
    }

    this.zone.run(() => {
      this.mapStatus.set('error');
    });
  };

  ngOnDestroy(): void {
    this.destroyed = true;

    this.resizeObserver?.disconnect();

    this.tiles?.off('tileload', this.onTileLoaded);
    this.tiles?.off('tileerror', this.onTileError);

    this.map?.remove();

    this.tiles = null;
    this.map = null;
  }
}