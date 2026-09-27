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

  private frameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private motionQuery: MediaQueryList | null = null;

  private destroyed = false;
  private initialized = false;

  // -1 garantiza la actualización inicial de accesibilidad.
  private activeScene = -1;

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

    if (
      !this.section ||
      !this.sticky ||
      this.scenes.length !== 3
    ) {
      console.error(
        '[JANERDent About] No se encontraron el contenedor y las 3 escenas.',
      );

      return;
    }

    this.initialized = true;

    this.motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    this.motionQuery.addEventListener(
      'change',
      this.onMotionChange,
    );

    window.addEventListener('scroll', this.requestRender, {
      passive: true,
    });

    window.addEventListener('resize', this.requestRender, {
      passive: true,
    });

    // Mantiene el cálculo sincronizado con el tamaño real
    // del contenedor, incluyendo cambios de orientación.
    this.resizeObserver = new ResizeObserver(() => {
      this.requestRender();
    });

    this.resizeObserver.observe(this.section);
    this.resizeObserver.observe(this.sticky);

    this.render();
  }

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

  private readonly onMotionChange = (): void => {
    this.activeScene = -1;
    this.requestRender();
  };

  private render(): void {
    if (
      this.destroyed ||
      !this.section ||
      !this.sticky ||
      this.scenes.length !== 3
    ) {
      return;
    }

    if (this.motionQuery?.matches) {
      this.renderReducedMotion();
      return;
    }

    const rect = this.section.getBoundingClientRect();

    // Usa la altura real del sticky, coherente con 100svh.
    const scrollDistance = Math.max(
      1,
      this.section.offsetHeight - this.sticky.offsetHeight,
    );

    const progress = this.clamp(
      -rect.top / scrollDistance,
    );

    this.section.style.setProperty(
      '--scroll-progress',
      progress.toString(),
    );

    /*
     * Se conserva el recorrido original:
     *
     * primera mitad: escena 01 → escena 02
     * segunda mitad: escena 02 → escena 03
     *
     * Los extremos de cada tramo dejan una pausa de lectura.
     */
    const position = progress * (this.scenes.length - 1);

    const baseIndex = Math.min(
      Math.floor(position),
      this.scenes.length - 2,
    );

    const nextIndex = baseIndex + 1;
    const localProgress = position - baseIndex;

    const transition = this.smoothStep(
      this.clamp((localProgress - 0.08) / 0.84),
    );

    this.scenes.forEach((scene, index) => {
      let y = 100;

      if (index <= baseIndex) {
        y = 0;
      } else if (index === nextIndex) {
        y = 100 * (1 - transition);
      }

      /*
       * La escena entrante sube completa.
       * Su fondo opaco cubre imagen y texto anteriores.
       *
       * Sin fade, sin perspective y sin cambios de escala
       * que dejen huecos alrededor de la escena.
       */
      scene.style.transform =
        `translate3d(0, ${y}%, 0)`;

      scene.style.zIndex = String(index + 1);
    });

    const newActiveScene =
      transition >= 0.5 ? nextIndex : baseIndex;

    this.updateAccessibility(newActiveScene);
  }

  private updateAccessibility(activeIndex: number): void {
    if (this.activeScene === activeIndex) {
      return;
    }

    this.activeScene = activeIndex;

    this.scenes.forEach((scene, index) => {
      const active = index === activeIndex;

      scene.setAttribute(
        'aria-hidden',
        String(!active),
      );

      scene.inert = !active;
      scene.style.pointerEvents = active ? 'auto' : 'none';
    });

    if (this.currentLabel) {
      this.currentLabel.textContent =
        String(activeIndex + 1).padStart(2, '0');
    }
  }

  private renderReducedMotion(): void {
    this.section?.style.setProperty(
      '--scroll-progress',
      '0',
    );

    this.scenes.forEach((scene) => {
      scene.style.removeProperty('transform');
      scene.style.removeProperty('z-index');

      scene.removeAttribute('aria-hidden');
      scene.inert = false;
      scene.style.pointerEvents = 'auto';
    });

    this.activeScene = -1;
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
      this.requestRender,
    );

    this.motionQuery?.removeEventListener(
      'change',
      this.onMotionChange,
    );

    this.resizeObserver?.disconnect();

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}