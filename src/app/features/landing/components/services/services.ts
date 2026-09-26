import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements AfterViewInit, OnDestroy {

  /* =====================================================
     ELEMENTOS DEL DOM
  ===================================================== */

  @ViewChild('servicesSection')
  private servicesSection?: ElementRef<HTMLElement>;

  @ViewChild('toothImage')
  private toothImage?: ElementRef<HTMLImageElement>;


  /* =====================================================
     FRAMES DEL DIENTE
  ===================================================== */

  /**
   * Los 5 frames principales.
   *
   * Todos se encuentran en:
   *
   * public/assets/touch/
   *
   * Orden:
   *
   * 01 → Frente
   * 02 → Izquierda
   * 03 → Arriba
   * 04 → Derecha
   * 05 → Frente / Loop
   */

  private readonly framePaths = [
    '/assets/touch/01-tooth-front.webp',
    '/assets/touch/02-tooth-left.webp',
    '/assets/touch/03-tooth-top.webp',
    '/assets/touch/04-tooth-right.webp',
    '/assets/touch/05-tooth-front-loop.webp',
  ];


  /**
   * Total de frames.
   */

  private readonly totalFrames =
    this.framePaths.length;


  /**
   * Frame actualmente visible.
   */

  private currentFrame = 1;


  /**
   * Imágenes precargadas.
   */

  private readonly frameImages: HTMLImageElement[] = [];


  /**
   * requestAnimationFrame.
   */

  private frameRequest: number | null = null;


  /* =====================================================
     SERVICIOS
  ===================================================== */

  readonly services = [

    {
      number: '01',

      name: 'Limpieza dental',

      description:
        'Eliminamos placa y sarro para mantener una sonrisa saludable.',

      icon: 'cleaning',
    },


    {
      number: '02',

      name: 'Resinas dentales',

      description:
        'Restauraciones estéticas para recuperar la apariencia natural.',

      icon: 'resin',
    },


    {
      number: '03',

      name: 'Blanqueamiento dental',

      description:
        'Mejora el tono de tus dientes con tratamientos seguros.',

      icon: 'whitening',
    },


    {
      number: '04',

      name: 'Tratamientos de conductos',

      description:
        'Soluciones profesionales para conservar tus piezas dentales.',

      icon: 'root',
    },


    {
      number: '05',

      name: 'Implantes dentales',

      description:
        'Recupera función y estética con tecnología especializada.',

      icon: 'implant',
    },


    {
      number: '06',

      name: 'Prótesis dentales',

      description:
        'Alternativas personalizadas para devolver seguridad al sonreír.',

      icon: 'prosthesis',
    },

  ];


  /* =====================================================
     CONSTRUCTOR
  ===================================================== */

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}


  /* =====================================================
     INIT
  ===================================================== */

  ngAfterViewInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }


    /*
     * Precargamos los 5 frames.
     */

    this.preloadFrames();


    /*
     * Escuchamos el scroll.
     */

    window.addEventListener(
      'scroll',
      this.onScroll,
      {
        passive: true,
      }
    );


    /*
     * Mostramos inicialmente
     * el primer frame.
     */

    this.updateToothFrame();

  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }


    /*
     * Eliminamos el listener.
     */

    window.removeEventListener(
      'scroll',
      this.onScroll
    );


    /*
     * Cancelamos cualquier
     * animación pendiente.
     */

    if (this.frameRequest !== null) {

      cancelAnimationFrame(
        this.frameRequest
      );

      this.frameRequest = null;

    }

  }


  /* =====================================================
     PRELOAD
  ===================================================== */

  private preloadFrames(): void {

    this.framePaths.forEach(
      (path) => {

        const image =
          new Image();

        image.src =
          path;

        this.frameImages.push(
          image
        );

      }
    );

  }


  /* =====================================================
     SCROLL
  ===================================================== */

  private onScroll = (): void => {

    /*
     * Evitamos crear múltiples
     * requestAnimationFrame.
     */

    if (
      this.frameRequest !== null
    ) {

      return;

    }


    this.frameRequest =
      requestAnimationFrame(
        () => {

          this.frameRequest =
            null;

          this.updateToothFrame();

        }
      );

  };


  /* =====================================================
     ACTUALIZAR FRAME
  ===================================================== */

  private updateToothFrame(): void {

    const section =
      this.servicesSection?.nativeElement;

    const image =
      this.toothImage?.nativeElement;


    /*
     * Verificamos que los elementos
     * ya existan.
     */

    if (
      !section ||
      !image
    ) {

      return;

    }


    /*
     * Posición de la sección.
     */

    const rect =
      section.getBoundingClientRect();


    /*
     * Altura del viewport.

     */

    const viewportHeight =
      window.innerHeight;


    /*
     * Inicio de la animación.

     * El diente empieza a cambiar
     * cuando la sección entra
     * aproximadamente al 85%
     * del viewport.
     */

    const start =
      viewportHeight * 0.85;


    /*
     * Final de la animación.
     */

    const end =
      -section.offsetHeight * 0.15;


    /*
     * Calculamos el progreso.

     * 0 = inicio
     * 1 = final
     */

    const progress =
      (start - rect.top) /
      (start - end);


    /*
     * Limitamos el progreso
     * entre 0 y 1.
     */

    const clampedProgress =
      Math.max(
        0,
        Math.min(
          1,
          progress
        )
      );


    /*
     * Convertimos el progreso
     * en un frame.

     * 0%   → 01
     * 25%  → 02
     * 50%  → 03
     * 75%  → 04
     * 100% → 05
     */

    const frameIndex =
      Math.round(
        clampedProgress *
        (this.totalFrames - 1)
      );


    /*
     * El array empieza en 0.
     */

    const frameNumber =
      frameIndex + 1;


    /*
     * Evitamos actualizar
     * si ya estamos mostrando
     * ese frame.
     */

    if (
      frameNumber ===
      this.currentFrame
    ) {

      return;

    }


    /*
     * Guardamos el frame actual.
     */

    this.currentFrame =
      frameNumber;


    /*
     * Obtenemos la imagen
     * precargada.
     */

    const frame =
      this.frameImages[
        frameIndex
      ];


    /*
     * Solo cambiamos el src
     * cuando la imagen ya está
     * disponible.
     */

    if (
      frame &&
      frame.complete
    ) {

      image.src =
        frame.src;

    }

  }

}