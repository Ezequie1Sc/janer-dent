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
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnDestroy {
  private section: HTMLElement | null = null;
  private sticky: HTMLElement | null = null;
  private currentLabel: HTMLElement | null = null;

  private scenes: HTMLElement[] = [];
  private compositions: HTMLElement[] = [];
  private images: HTMLImageElement[] = [];

  private motionQuery: MediaQueryList | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private frameId: number | null = null;

  private initialized = false;
  private destroyed = false;
  private layoutDirty = true;
  private activeScene = -1;

  private overflowDistances: number[] = [];
  private sceneStarts: number[] = [];

  private holdDistance = 0;
  private transitionDistance = 1;
  private totalDistance = 1;

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
      root.querySelector<HTMLElement>('.about-section');

    this.sticky =
      root.querySelector<HTMLElement>('.about-sticky');

    this.currentLabel =
      root.querySelector<HTMLElement>('.progress-current');

    this.scenes = Array.from(
      root.querySelectorAll<HTMLElement>('.about-scene'),
    );

    this.compositions = Array.from(
      root.querySelectorAll<HTMLElement>('.scene-composition'),
    );

    this.images = Array.from(
      root.querySelectorAll<HTMLImageElement>('.scene-image img'),
    );

    if (
      !this.section ||
      !this.sticky ||
      this.scenes.length !== 3 ||
      this.compositions.length !== 3
    ) {
      return;
    }

    this.motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    this.initialized = true;

    window.addEventListener('scroll', this.requestRender, {
      passive: true,
    });

    window.addEventListener('resize', this.onLayoutChange, {
      passive: true,
    });

    this.motionQuery.addEventListener(
      'change',
      this.onLayoutChange,
    );

    this.images.forEach((image) => {
      image.addEventListener('load', this.onLayoutChange);
      image.addEventListener('error', this.onLayoutChange);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onLayoutChange();
      });

      this.resizeObserver.observe(this.sticky);

      this.compositions.forEach((composition) => {
        this.resizeObserver?.observe(composition);
      });
    }

    this.render();
  }

  private readonly onLayoutChange = (): void => {
    this.layoutDirty = true;
    this.requestRender();
  };

  private readonly requestRender = (): void => {
    if (
      this.destroyed ||
      !this.initialized ||
      this.frameId !== null
    ) {
      return;
    }

    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null;

      if (!this.destroyed) {
        this.render();
      }
    });
  };

  private measureLayout(): void {
    if (!this.section || !this.sticky) {
      return;
    }

    this.layoutDirty = false;

    if (this.motionQuery?.matches) {
      this.showAllScenes();
      return;
    }

    this.section.classList.add('is-story');

    const viewportHeight = this.sticky.clientHeight;

    /*
     * Medimos el espacio real de lectura descontando
     * las franjas superior e inferior.
     */
    const sceneStyle = window.getComputedStyle(
      this.scenes[0],
    );

    const paddingTop =
      Number.parseFloat(sceneStyle.paddingTop) || 0;

    const paddingBottom =
      Number.parseFloat(sceneStyle.paddingBottom) || 0;

    const readingHeight = Math.max(
      1,
      viewportHeight - paddingTop - paddingBottom,
    );

    /*
     * Cuánto debe subir el contenido de cada escena
     * antes de pasar a la siguiente.
     */
    this.overflowDistances = this.compositions.map(
      (composition) => {
        const contentHeight = Math.max(
          composition.offsetHeight,
          composition.scrollHeight,
        );

        return Math.max(0, contentHeight - readingHeight);
      },
    );

    // Pausas al inicio y al final de cada escena.
    this.holdDistance = Math.max(
      60,
      viewportHeight * 0.16,
    );

    // Distancia de scroll dedicada a pasar de página.
    this.transitionDistance = Math.max(
      220,
      viewportHeight * 0.85,
    );

    this.sceneStarts = [];

    let distance = 0;

    this.scenes.forEach((_, index) => {
      this.sceneStarts.push(distance);

      distance +=
        this.holdDistance +
        this.overflowDistances[index] +
        this.holdDistance;

      if (index < this.scenes.length - 1) {
        distance += this.transitionDistance;
      }
    });

    this.totalDistance = Math.max(1, distance);

    this.section.style.setProperty(
      '--about-story-height',
      `${Math.ceil(viewportHeight + this.totalDistance)}px`,
    );
  }

  private render(): void {
    if (
      this.destroyed ||
      !this.section ||
      !this.sticky
    ) {
      return;
    }

    if (this.layoutDirty) {
      this.measureLayout();
    }

    if (this.motionQuery?.matches) {
      return;
    }

    const rect = this.section.getBoundingClientRect();

    const distance = Math.max(
      0,
      Math.min(this.totalDistance, -rect.top),
    );

    this.section.style.setProperty(
      '--scroll-progress',
      String(distance / this.totalDistance),
    );

    let activeIndex = 0;

    this.scenes.forEach((scene, index) => {
      const start = this.sceneStarts[index];

      /*
       * 1. Pausa de lectura.
       * 2. Recorrido de la tarjeta si es larga.
       * 3. Pausa antes de la transición.
       */
      const contentTravel = Math.max(
        0,
        Math.min(
          this.overflowDistances[index],
          distance - start - this.holdDistance,
        ),
      );

      this.compositions[index].style.setProperty(
        '--about-content-y',
        `${-contentTravel}px`,
      );

      let entrance = 1;

      if (index > 0) {
        const transitionStart =
          start - this.transitionDistance;

        entrance = this.smoothStep(
          this.clamp(
            (distance - transitionStart) /
              this.transitionDistance,
          ),
        );
      }

      /*
       * La escena siguiente sube desde abajo y
       * cubre completamente la anterior.
       */
      const y = 100 * (1 - entrance);

      scene.style.transform =
        `translate3d(0, ${y}%, 0)`;

      scene.style.zIndex = String(index + 1);

      if (entrance >= 0.5) {
        activeIndex = index;
      }
    });

    this.updateAccessibility(activeIndex);
  }

  private updateAccessibility(activeIndex: number): void {
    if (this.activeScene === activeIndex) {
      return;
    }

    this.activeScene = activeIndex;

    this.scenes.forEach((scene, index) => {
      const active = index === activeIndex;

      scene.setAttribute('aria-hidden', String(!active));
      scene.inert = !active;

      scene.style.pointerEvents =
        active ? 'auto' : 'none';
    });

    if (this.currentLabel) {
      this.currentLabel.textContent =
        String(activeIndex + 1).padStart(2, '0');
    }
  }

  private showAllScenes(): void {
    this.section?.classList.remove('is-story');

    this.section?.style.removeProperty(
      '--about-story-height',
    );

    this.section?.style.setProperty(
      '--scroll-progress',
      '0',
    );

    this.scenes.forEach((scene) => {
      scene.style.removeProperty('transform');
      scene.style.removeProperty('z-index');
      scene.style.removeProperty('pointer-events');

      scene.removeAttribute('aria-hidden');
      scene.inert = false;
    });

    this.compositions.forEach((composition) => {
      composition.style.removeProperty(
        '--about-content-y',
      );
    });

    this.activeScene = -1;

    if (this.currentLabel) {
      this.currentLabel.textContent = '01';
    }
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private smoothStep(value: number): number {
    return value * value * (3 - 2 * value);
  }

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
      this.onLayoutChange,
    );

    this.motionQuery?.removeEventListener(
      'change',
      this.onLayoutChange,
    );

    this.images.forEach((image) => {
      image.removeEventListener(
        'load',
        this.onLayoutChange,
      );

      image.removeEventListener(
        'error',
        this.onLayoutChange,
      );
    });

    this.resizeObserver?.disconnect();

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}