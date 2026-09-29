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

  private frameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private motionQuery: MediaQueryList | null = null;
  private desktopQuery: MediaQueryList | null = null;

  private destroyed = false;
  private initialized = false;
  private layoutDirty = true;

  private storyEnabled = false;
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

    this.desktopQuery = window.matchMedia(
      '(min-width: 761px)',
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

    this.desktopQuery.addEventListener(
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

      // Detecta cambios de tamaño por imágenes, fuentes
      // o ampliación del texto.
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

  private updateLayout(): void {
    if (!this.section) {
      return;
    }

    this.layoutDirty = false;

    const headerSpace =
      Number.parseFloat(
        window
          .getComputedStyle(this.section)
          .getPropertyValue('--about-header-space'),
      ) || 96;

    const viewportHeight = window.innerHeight;

    // Coincide con el espacio superior e inferior del CSS.
    const availableHeight =
      viewportHeight - headerSpace - 48;

    const tallestComposition = Math.max(
      ...this.compositions.map((composition) =>
        Math.max(
          composition.getBoundingClientRect().height,
          composition.scrollHeight,
        ),
      ),
    );

    const shouldEnableStory =
      this.desktopQuery?.matches === true &&
      this.motionQuery?.matches !== true &&
      tallestComposition <= availableHeight - 4;

    if (shouldEnableStory === this.storyEnabled) {
      return;
    }

    this.storyEnabled = shouldEnableStory;
    this.activeScene = -1;

    this.section.classList.toggle(
      'is-story',
      this.storyEnabled,
    );

    if (!this.storyEnabled) {
      this.showAllScenes();
    }
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
      this.updateLayout();
    }

    if (!this.storyEnabled) {
      return;
    }

    const rect = this.section.getBoundingClientRect();

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

    this.desktopQuery?.removeEventListener(
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