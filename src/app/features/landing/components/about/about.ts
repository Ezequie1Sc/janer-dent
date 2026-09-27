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

  private scenes: HTMLElement[] = [];

  private frameId: number | null = null;

  private destroyed = false;

  private initialized = false;

  private activeScene = 0;


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


  /* =========================================================
     INITIALIZE
  ========================================================= */

  private initialize(): void {

    if (
      this.initialized ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }


    const root =
      this.host.nativeElement;


    this.section =
      root.querySelector<HTMLElement>(
        '.about-section'
      );


    this.scenes =
      Array.from(
        root.querySelectorAll<HTMLElement>(
          '.about-scene'
        )
      );


    if (
      !this.section ||
      this.scenes.length !== 3
    ) {

      console.error(
        '[JANERDent About] No se encontraron las 3 escenas.'
      );

      return;

    }


    this.initialized = true;


    /*
     * Estado inicial.
     */

    this.render();


    /*
     * Scroll.
     */

    window.addEventListener(
      'scroll',
      this.onScroll,
      {
        passive: true,
      }
    );


    /*
     * Resize.
     */

    window.addEventListener(
      'resize',
      this.onResize,
      {
        passive: true,
      }
    );


    /*
     * Pequeño delay para asegurar
     * que las imágenes hayan sido
     * calculadas por el navegador.
     */

    requestAnimationFrame(() => {

      if (!this.destroyed) {
        this.render();
      }

    });

  }


  /* =========================================================
     SCROLL
  ========================================================= */

  private readonly onScroll = (): void => {

    if (
      this.destroyed ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }


    if (this.frameId !== null) {
      return;
    }


    this.frameId =
      requestAnimationFrame(() => {

        this.frameId = null;

        if (!this.destroyed) {
          this.render();
        }

      });

  };


  /* =========================================================
     RESIZE
  ========================================================= */

  private readonly onResize = (): void => {

    if (
      this.destroyed ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }


    if (this.frameId !== null) {
      return;
    }


    this.frameId =
      requestAnimationFrame(() => {

        this.frameId = null;

        if (!this.destroyed) {
          this.render();
        }

      });

  };


  /* =========================================================
     RENDER
  ========================================================= */

  private render(): void {

    if (
      !isPlatformBrowser(this.platformId) ||
      this.destroyed ||
      !this.section ||
      this.scenes.length !== 3
    ) {
      return;
    }


    const rect =
      this.section.getBoundingClientRect();


    const sectionHeight =
      this.section.offsetHeight;


    const viewportHeight =
      window.innerHeight;


    const scrollDistance =
      Math.max(
        1,
        sectionHeight - viewportHeight
      );


    const traveled =
      Math.min(
        Math.max(
          -rect.top,
          0
        ),
        scrollDistance
      );


    const progress =
      traveled / scrollDistance;


    this.section.style.setProperty(
      '--scroll-progress',
      progress.toString()
    );


    const storyProgress =
      this.clamp(
        progress
      );


    const position =
      storyProgress *
      (this.scenes.length - 1);


    const baseIndex =
      Math.min(
        Math.floor(position),
        this.scenes.length - 2
      );


    const nextIndex =
      baseIndex + 1;


    const localProgress =
      position - baseIndex;


    const transition =
      this.smoothStep(
        this.clamp(
          (localProgress - 0.08) / 0.84
        )
      );


    this.scenes.forEach(
      (scene, index) => {

        if (index < baseIndex) {

          scene.style.transform =
            'translate3d(0, -4%, -20px) scale(0.985)';

          scene.style.opacity =
            '1';

          scene.style.zIndex =
            String(index + 1);

        }

        else if (index === baseIndex) {

          const y =
            -4 * transition;


          const scale =
            1 -
            (0.015 * transition);


          scene.style.transform =
            `
            translate3d(
              0,
              ${y}%,
              -${20 * transition}px
            )
            scale(${scale})
            `;


          scene.style.opacity =
            '1';


          scene.style.zIndex =
            String(index + 1);

        }

        else if (index === nextIndex) {

          const y =
            100 *
            (1 - transition);


          const z =
            70 *
            (1 - transition);


          const scale =
            0.975 +
            (0.025 * transition);


          scene.style.transform =
            `
            translate3d(
              0,
              ${y}%,
              ${z}px
            )
            scale(${scale})
            `;


          scene.style.opacity =
            '1';


          scene.style.zIndex =
            String(index + 10);

        }

        else {

          scene.style.transform =
            'translate3d(0, 100%, 70px) scale(0.975)';

          scene.style.opacity =
            '1';

          scene.style.zIndex =
            String(index + 1);

        }

      }
    );


    const newActiveScene =
      transition >= 0.5
        ? nextIndex
        : baseIndex;


    this.updateAccessibility(
      newActiveScene
    );

  }


  /* =========================================================
     ACCESSIBILITY
  ========================================================= */

  private updateAccessibility(
    activeIndex: number
  ): void {

    if (
      this.activeScene === activeIndex
    ) {
      return;
    }


    this.activeScene =
      activeIndex;


    this.scenes.forEach(
      (scene, index) => {

        const active =
          index === activeIndex;


        scene.setAttribute(
          'aria-hidden',
          String(!active)
        );


        scene.style.pointerEvents =
          active
            ? 'auto'
            : 'none';

      }
    );

  }


  /* =========================================================
     HELPERS
  ========================================================= */

  private clamp(
    value: number
  ): number {

    return Math.max(
      0,
      Math.min(
        1,
        value
      )
    );

  }


  private smoothStep(
    value: number
  ): number {

    return (
      value *
      value *
      (3 - 2 * value)
    );

  }


  /* =========================================================
     DESTROY
  ========================================================= */

  ngOnDestroy(): void {

    this.destroyed = true;


    /*
     * Las APIs del navegador solamente
     * existen en el cliente.
     */

    if (
      isPlatformBrowser(this.platformId)
    ) {

      window.removeEventListener(
        'scroll',
        this.onScroll
      );


      window.removeEventListener(
        'resize',
        this.onResize
      );


      if (
        this.frameId !== null
      ) {

        cancelAnimationFrame(
          this.frameId
        );

        this.frameId = null;

      }

    }

  }

}