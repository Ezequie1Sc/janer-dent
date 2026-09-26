import {
  afterNextRender,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
} from '@angular/core';

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

    if (this.initialized) {
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

      this.render();

    });

  }


  /* =========================================================
     SCROLL
  ========================================================= */

  private readonly onScroll = (): void => {

    if (this.frameId !== null) {
      return;
    }


    this.frameId =
      requestAnimationFrame(() => {

        this.frameId = null;

        this.render();

      });

  };


  /* =========================================================
     RESIZE
  ========================================================= */

  private readonly onResize = (): void => {

    if (this.frameId !== null) {
      return;
    }


    this.frameId =
      requestAnimationFrame(() => {

        this.frameId = null;

        this.render();

      });

  };


  /* =========================================================
     RENDER
  ========================================================= */

  private render(): void {

    if (
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


    /*
     * Distancia real que podemos recorrer
     * mientras la sección está en pantalla.
     */

    const scrollDistance =
      Math.max(
        1,
        sectionHeight - viewportHeight
      );


    /*
     * Cuánto hemos recorrido.
     */

    const traveled =
      Math.min(
        Math.max(
          -rect.top,
          0
        ),
        scrollDistance
      );


    /*
     * 0 → 1
     */

    const progress =
      traveled / scrollDistance;


    /*
     * Guardamos el progreso.
     */

    this.section.style.setProperty(
      '--scroll-progress',
      progress.toString()
    );


    /*
     * Hay 3 escenas.
     *
     * 0 → 0.5
     * escena 1 → escena 2
     *
     * 0.5 → 1
     * escena 2 → escena 3
     */

    const storyProgress =
      this.clamp(
        progress
      );


    /*
     * Posición continua.
     *
     * 0 = escena 1
     * 1 = escena 2
     * 2 = escena 3
     */

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


    /*
     * Zona de transición.
     *
     * No empieza inmediatamente.
     *
     * Tampoco termina inmediatamente.
     */

    const transition =
      this.smoothStep(
        this.clamp(
          (localProgress - 0.08) / 0.84
        )
      );


    /*
     * ESCENAS
     */

    this.scenes.forEach(
      (scene, index) => {

        /*
         * Escena anterior.
         */

        if (index < baseIndex) {

          scene.style.transform =
            'translate3d(0, -4%, -20px) scale(0.985)';

          scene.style.opacity =
            '1';

          scene.style.zIndex =
            String(index + 1);

        }


        /*
         * ESCENA ACTUAL
         */

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


        /*
         * ESCENA QUE ENTRA
         */

        else if (index === nextIndex) {

          /*
           * AQUÍ ESTÁ EL EFECTO
           * DE CORTINA VERTICAL.
           *
           * Empieza debajo:
           *
           * translateY(100%)
           *
           * y sube hasta:
           *
           * translateY(0)
           */

          const y =
            100 *
            (1 - transition);


          /*
           * Pequeño efecto 3D.
           */

          const z =
            70 *
            (1 - transition);


          /*
           * La nueva escena comienza
           * ligeramente más pequeña.
           */

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


          /*
           * MUY IMPORTANTE:
           * la escena nueva queda
           * encima de la anterior.
           */

          scene.style.zIndex =
            String(index + 10);

        }


        /*
         * Escenas futuras.
         */

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


    /*
     * Actualizamos escena activa.
     */

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