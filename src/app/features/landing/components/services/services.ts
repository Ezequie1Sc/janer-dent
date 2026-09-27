import {
  afterNextRender,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnDestroy {
  private section: HTMLElement | null = null;
  private toothStage: HTMLElement | null = null;
  private toothImage: HTMLImageElement | null = null;

  private rows: HTMLElement[] = [];

  private readonly framePaths = [
    '/assets/touch/01-tooth-front.webp',
    '/assets/touch/02-tooth-left.webp',
    '/assets/touch/03-tooth-top.webp',
    '/assets/touch/04-tooth-right.webp',
    '/assets/touch/05-tooth-front-loop.webp',
  ];

  private readonly frameImages: HTMLImageElement[] = [];

  private currentFrame = -1;
  private activeRow = -1;

  private frameRequest: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private motionQuery: MediaQueryList | null = null;

  private initialized = false;
  private destroyed = false;

  readonly services = [
    {
      number: '01',
      name: 'Limpieza dental',
      description:
        'Eliminamos placa y sarro para cuidar tu sonrisa.',
      paths: [
        'M6 22 20 8m-2-2 8 8M4 25l3 3 4-4M23 18v5m-2.5-2.5h5M8 6v4M6 8h4',
      ],
    },
    {
      number: '02',
      name: 'Resinas dentales',
      description:
        'Recuperamos la apariencia natural de tus dientes.',
      paths: [
        'M16 8c-3-2-8-2-10 2-2 4 1 8 2 12 1 4 2 5 4 5 2 0 2-6 4-6s2 6 4 6c2 0 3-1 4-5 1-4 4-8 2-12-2-4-7-4-10-2Z',
        'm16 9-3 4 3 3 3-3-3-4Z',
      ],
    },
    {
      number: '03',
      name: 'Blanqueamiento dental',
      description:
        'Un tono más luminoso para tu sonrisa.',
      paths: [
        'M15 9c-3-2-7-2-9 2-2 4 1 8 2 12 1 4 2 5 4 5 2 0 2-6 4-6s2 6 4 6c2 0 3-1 4-5 1-4 4-8 2-12-2-4-6-4-9-2',
        'M23 3v7M19.5 6.5h7M27 13v4m-2-2h4',
      ],
    },
    {
      number: '04',
      name: 'Tratamientos de conductos',
      description:
        'Atención profesional para conservar tus piezas dentales.',
      paths: [
        'M16 7c-3-2-8-2-10 2-2 4 1 8 2 12 1 4 2 5 4 5 2 0 2-6 4-6s2 6 4 6c2 0 3-1 4-5 1-4 4-8 2-12-2-4-7-4-10-2Z',
        'M16 10v7m-4-4 4 4 4-4m-4 4v8',
      ],
    },
    {
      number: '05',
      name: 'Implantes dentales',
      description:
        'Recupera función y estética con un plan personalizado.',
      paths: [
        'M8 5h16v4c0 4-3 6-8 6s-8-2-8-6V5Zm4 10v11l4 4 4-4V15M11 19h10m-10 4h10m-8 4h6',
      ],
    },
    {
      number: '06',
      name: 'Prótesis dentales',
      description:
        'Comodidad y confianza al volver a sonreír.',
      paths: [
        'M3 12c4-3 8-3 13-1 5-2 9-2 13 1l-2 8c-1 4-3 5-5 5-2 0-2-5-6-5s-4 5-6 5c-2 0-4-1-5-5l-2-8Z',
        'M10 11v10m6-10v9m6-9v10',
      ],
    },
  ];

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,

    @Inject(PLATFORM_ID)
    private readonly platformId: object,
  ) {
    afterNextRender(() => {
      if (this.destroyed) {
        return;
      }

      this.zone.runOutsideAngular(() => {
        this.initialize();
      });
    });
  }

  /* =====================================================
     INICIALIZACIÓN
  ===================================================== */

  private initialize(): void {
    if (
      this.initialized ||
      this.destroyed ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }

    const root = this.host.nativeElement;

    this.section =
      root.querySelector<HTMLElement>('.services-section');

    this.toothStage =
      root.querySelector<HTMLElement>('.tooth-stage');

    this.toothImage =
      root.querySelector<HTMLImageElement>('.tooth-frame');

    this.rows = Array.from(
      root.querySelectorAll<HTMLElement>('.service-item'),
    );

    if (
      !this.section ||
      !this.toothStage ||
      !this.toothImage ||
      this.rows.length === 0
    ) {
      console.error(
        '[JANERDent Services] No se encontraron los elementos de la sección.',
      );

      return;
    }

    this.motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    this.initialized = true;

    window.addEventListener('scroll', this.requestRender, {
      passive: true,
    });

    window.addEventListener('resize', this.requestRender, {
      passive: true,
    });

    this.motionQuery.addEventListener(
      'change',
      this.requestRender,
    );

    this.resizeObserver = new ResizeObserver(() => {
      this.requestRender();
    });

    this.resizeObserver.observe(this.section);
    this.resizeObserver.observe(this.toothStage);

    this.preloadFrames();
    this.render();
  }

  /* =====================================================
     PRECARGA DE LOS CINCO ÁNGULOS
  ===================================================== */

  private preloadFrames(): void {
    this.framePaths.forEach((path) => {
      const image = new Image();

      image.decoding = 'async';

      image.onload = () => {
        this.requestRender();
      };

      image.src = path;

      this.frameImages.push(image);
    });
  }

  /* =====================================================
     ACTUALIZACIÓN SIN SATURAR EL SCROLL
  ===================================================== */

  private readonly requestRender = (): void => {
    if (
      this.destroyed ||
      !this.initialized ||
      this.frameRequest !== null
    ) {
      return;
    }

    this.frameRequest = window.requestAnimationFrame(() => {
      this.frameRequest = null;

      if (!this.destroyed) {
        this.render();
      }
    });
  };

  /* =====================================================
     PROGRESO DURANTE TODA LA LISTA
  ===================================================== */

  private render(): void {
    if (
      this.destroyed ||
      !this.section ||
      !this.toothStage ||
      this.rows.length === 0
    ) {
      return;
    }

    if (this.motionQuery?.matches) {
      this.renderReducedMotion();
      return;
    }

    const viewportHeight = window.innerHeight;

    const sectionRect =
      this.section.getBoundingClientRect();

    if (
      sectionRect.bottom < 0 ||
      sectionRect.top > viewportHeight
    ) {
      return;
    }

    // Primero leemos las posiciones; después escribimos estilos.
    const rowRects = this.rows.map((row) =>
      row.getBoundingClientRect(),
    );

    const firstRow = rowRects[0];
    const lastRow = rowRects[rowRects.length - 1];

    const firstCenter =
      firstRow.top + firstRow.height / 2;

    const lastCenter =
      lastRow.top + lastRow.height / 2;

    /*
     * Primer servicio entrando: primer ángulo.
     * Último servicio en lectura: último ángulo.
     *
     * El cálculo usa la lista, porque el diente
     * permanece sticky y su posición deja de cambiar.
     */
    const startLine = viewportHeight * 0.8;
    const endLine = viewportHeight * 0.55;

    const scrollDistance = Math.max(
      1,
      lastCenter - firstCenter + startLine - endLine,
    );

    const toothProgress = this.clamp(
      (startLine - firstCenter) / scrollDistance,
    );

    this.updateTooth(toothProgress);
    this.updateRows(rowRects, viewportHeight);
  }

  /* =====================================================
     MOVIMIENTO Y CAMBIO DE ÁNGULO DEL DIENTE
  ===================================================== */

  private updateTooth(progress: number): void {
    if (!this.section) {
      return;
    }

    const eased = this.smoothStep(progress);

    const y = 12 - eased * 24;
    const rotation = -2 + eased * 4;

    this.section.style.setProperty(
      '--tooth-y',
      `${y.toFixed(2)}px`,
    );

    this.section.style.setProperty(
      '--tooth-rotation',
      `${rotation.toFixed(2)}deg`,
    );

    const frameIndex = Math.round(
      progress * (this.framePaths.length - 1),
    );

    this.showFrame(frameIndex);
  }

  private showFrame(index: number): void {
    if (
      !this.toothImage ||
      index === this.currentFrame
    ) {
      return;
    }

    const frame = this.frameImages[index];

    /*
     * Conserva el último frame válido si el siguiente
     * todavía no ha cargado o el archivo ha fallado.
     */
    if (
      !frame ||
      !frame.complete ||
      frame.naturalWidth === 0
    ) {
      return;
    }

    this.toothImage.src = frame.src;
    this.currentFrame = index;
  }

  /* =====================================================
     ENTRADA Y ÉNFASIS DE LOS SERVICIOS
  ===================================================== */

  private updateRows(
    rects: DOMRect[],
    viewportHeight: number,
  ): void {
    const focusLine = viewportHeight * 0.52;

    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    rects.forEach((rect, index) => {
      const visible =
        rect.bottom > 0 &&
        rect.top < viewportHeight;

      const distance = Math.abs(
        rect.top + rect.height / 2 - focusLine,
      );

      if (visible && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }

      const progress = this.clamp(
        (viewportHeight * 0.92 - rect.top) /
        Math.max(1, viewportHeight * 0.38),
      );

      const eased = this.smoothStep(progress);

      this.rows[index].style.setProperty(
        '--row-y',
        `${(16 * (1 - eased)).toFixed(2)}px`,
      );

      this.rows[index].style.setProperty(
        '--row-progress',
        eased.toFixed(4),
      );
    });

    if (closestIndex !== this.activeRow) {
      this.activeRow = closestIndex;

      this.rows.forEach((row, index) => {
        row.classList.toggle(
          'is-active',
          index === closestIndex,
        );
      });
    }
  }

  /* =====================================================
     MOVIMIENTO REDUCIDO
  ===================================================== */

  private renderReducedMotion(): void {
    this.section?.style.setProperty('--tooth-y', '0px');

    this.section?.style.setProperty(
      '--tooth-rotation',
      '0deg',
    );

    this.rows.forEach((row) => {
      row.style.setProperty('--row-y', '0px');
      row.style.setProperty('--row-progress', '0');
      row.classList.remove('is-active');
    });

    this.activeRow = -1;
    this.showFrame(0);
  }

  /* =====================================================
     UTILIDADES
  ===================================================== */

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private smoothStep(value: number): number {
    return value * value * (3 - 2 * value);
  }

  /* =====================================================
     LIMPIEZA
  ===================================================== */

  ngOnDestroy(): void {
    this.destroyed = true;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.removeEventListener(
      'scroll',
      this.requestRender,
    );

    window.removeEventListener(
      'resize',
      this.requestRender,
    );

    this.motionQuery?.removeEventListener(
      'change',
      this.requestRender,
    );

    this.resizeObserver?.disconnect();

    if (this.frameRequest !== null) {
      window.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }

    this.frameImages.forEach((image) => {
      image.onload = null;
    });
  }
}