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

interface DentalService {
  number: string;
  name: string;
  category: string;
  description: string;
}

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
    '/assets/services/01-tooth-front.webp',
    '/assets/services/02-tooth-left.webp',
    '/assets/services/03-tooth-top.webp',
    '/assets/services/04-tooth-right.webp',
    '/assets/services/05-tooth-front-loop.webp',
  ];

  private readonly frameImages: HTMLImageElement[] = [];

  private currentFrame = -1;
  private activeRow = -1;

  private frameRequest: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private motionQuery: MediaQueryList | null = null;

  private initialized = false;
  private destroyed = false;

  readonly services: readonly DentalService[] = [
    {
      number: '01',
      name: 'Limpieza dental',
      category: 'Prevención',
      description:
        'Eliminación de placa y sarro para mantener tus dientes y encías limpios, como parte del cuidado de tu salud bucal.',
    },
    {
      number: '02',
      name: 'Resinas dentales',
      category: 'Restauración',
      description:
        'Restauraciones del color del diente para reparar zonas dañadas y recuperar su forma y apariencia natural.',
    },
    {
      number: '03',
      name: 'Blanqueamiento dental',
      category: 'Estética dental',
      description:
        'Un tratamiento para aclarar el tono de tus dientes, con un plan definido según las características de tu sonrisa.',
    },
    {
      number: '04',
      name: 'Endodoncia',
      category: 'Conservación dental',
      description:
        'Tratamiento del interior del diente cuando la pulpa está afectada, con el objetivo de conservar la pieza dental.',
    },
    {
      number: '05',
      name: 'Prostodoncia Total',
      category: 'Rehabilitación oral',
      description:
        'Prótesis completas para reemplazar los dientes de una arcada y ayudar a recuperar la función y apariencia de tu sonrisa.',
    },
    {
      number: '06',
      name: 'Prótesis fijas y removibles',
      category: 'Rehabilitación oral',
      description:
        'Opciones para reemplazar dientes ausentes, seleccionadas de acuerdo con tus necesidades y las condiciones de tu boca.',
    },
    {
      number: '07',
      name: 'Extracción dental',
      category: 'Atención dental',
      description:
        'Retiro de una pieza dental cuando está indicado, con valoración previa e indicaciones para los cuidados posteriores.',
    },
    {
      number: '08',
      name: 'Incrustaciones dentales',
      category: 'Restauración',
      description:
        'Restauraciones elaboradas a medida para reparar parte de un diente y recuperar su forma y función.',
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
      root.querySelector<HTMLElement>('.services');

    this.toothStage =
      root.querySelector<HTMLElement>('.services__visual');

    this.toothImage =
      root.querySelector<HTMLImageElement>('.services__tooth');

    this.rows = Array.from(
      root.querySelectorAll<HTMLElement>('.service')
    );

    if (
      !this.section ||
      !this.toothStage ||
      !this.toothImage ||
      !this.rows.length
    ) {
      console.error(
        '[Services] No se encontraron los elementos de la animación.',
        {
          section: !!this.section,
          toothStage: !!this.toothStage,
          toothImage: !!this.toothImage,
          services: this.rows.length,
        }
      );

      return;
    }

    this.motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    this.initialized = true;

    window.addEventListener('scroll', this.requestRender, {
      passive: true,
      capture: true,
    });

    window.addEventListener('resize', this.requestRender, {
      passive: true,
    });

    this.motionQuery.addEventListener(
      'change',
      this.requestRender
    );

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(
        this.requestRender
      );

      this.resizeObserver.observe(this.section);
      this.resizeObserver.observe(this.toothStage);
    }

    this.preloadFrames();
    this.render();
  }

  /* PRECARGA DE LOS CINCO ÁNGULOS */

  private preloadFrames(): void {
    this.framePaths.forEach((path) => {
      const image = new Image();

      image.decoding = 'async';

      image.onload = () => {
        this.requestRender();
      };

      image.onerror = () => {
        if (!this.destroyed) {
          console.error(
            `[Services] No se pudo cargar el fotograma: ${path}`
          );
        }
      };

      this.frameImages.push(image);
      image.src = path;
    });
  }

  /* UNA ACTUALIZACIÓN POR FOTOGRAMA DEL NAVEGADOR */

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

  /* PROGRESO DEL SCROLL */

  private render(): void {
    if (
      this.destroyed ||
      !this.section ||
      !this.toothStage ||
      !this.rows.length
    ) {
      return;
    }

    if (this.motionQuery?.matches) {
      this.renderReducedMotion();
      return;
    }

    const viewportHeight = window.innerHeight;
    const sectionRect = this.section.getBoundingClientRect();

    if (
      sectionRect.bottom < 0 ||
      sectionRect.top > viewportHeight
    ) {
      return;
    }

    const rowRects = this.rows.map((row) =>
      row.getBoundingClientRect()
    );

    const firstRow = rowRects[0];
    const lastRow = rowRects[rowRects.length - 1];

    const firstCenter =
      firstRow.top + firstRow.height / 2;

    const lastCenter =
      lastRow.top + lastRow.height / 2;

    const startLine = viewportHeight * 0.8;
    const endLine = viewportHeight * 0.55;

    const scrollDistance = Math.max(
      1,
      lastCenter - firstCenter + startLine - endLine
    );

    const toothProgress = this.clamp(
      (startLine - firstCenter) / scrollDistance
    );

    this.updateTooth(toothProgress);
    this.updateRows(rowRects, viewportHeight);
  }

  /* MOVIMIENTO ORIGINAL DEL DIENTE */

  private updateTooth(progress: number): void {
    if (!this.section) {
      return;
    }

    const eased = this.smoothStep(progress);

    const y = 12 - eased * 24;
    const rotation = -2 + eased * 4;

    this.section.style.setProperty(
      '--tooth-y',
      `${y.toFixed(2)}px`
    );

    this.section.style.setProperty(
      '--tooth-rotation',
      `${rotation.toFixed(2)}deg`
    );

    const frameIndex = Math.round(
      progress * (this.framePaths.length - 1)
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

  /* ENTRADA Y ÉNFASIS DE SERVICIOS */

  private updateRows(
    rects: DOMRect[],
    viewportHeight: number
  ): void {
    const focusLine = viewportHeight * 0.52;

    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    rects.forEach((rect, index) => {
      const visible =
        rect.bottom > 0 &&
        rect.top < viewportHeight;

      const distance = Math.abs(
        rect.top + rect.height / 2 - focusLine
      );

      if (visible && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }

      const progress = this.clamp(
        (viewportHeight * 0.92 - rect.top) /
          Math.max(1, viewportHeight * 0.38)
      );

      const eased = this.smoothStep(progress);

      this.rows[index].style.setProperty(
        '--row-y',
        `${(16 * (1 - eased)).toFixed(2)}px`
      );

      this.rows[index].style.setProperty(
        '--row-progress',
        eased.toFixed(4)
      );
    });

    if (closestIndex !== this.activeRow) {
      this.activeRow = closestIndex;

      this.rows.forEach((row, index) => {
        row.classList.toggle(
          'is-active',
          index === closestIndex
        );
      });
    }
  }

  /* ACCESIBILIDAD */

  private renderReducedMotion(): void {
    this.section?.style.setProperty('--tooth-y', '0px');

    this.section?.style.setProperty(
      '--tooth-rotation',
      '0deg'
    );

    this.rows.forEach((row) => {
      row.style.setProperty('--row-y', '0px');
      row.style.setProperty('--row-progress', '0');
      row.classList.remove('is-active');
    });

    this.activeRow = -1;
    this.showFrame(0);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private smoothStep(value: number): number {
    return value * value * (3 - 2 * value);
  }

  /* LIMPIEZA */

  ngOnDestroy(): void {
    this.destroyed = true;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.removeEventListener(
      'scroll',
      this.requestRender,
      true
    );

    window.removeEventListener(
      'resize',
      this.requestRender
    );

    this.motionQuery?.removeEventListener(
      'change',
      this.requestRender
    );

    this.resizeObserver?.disconnect();

    if (this.frameRequest !== null) {
      window.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }

    this.frameImages.forEach((image) => {
      image.onload = null;
      image.onerror = null;
    });
  }
}