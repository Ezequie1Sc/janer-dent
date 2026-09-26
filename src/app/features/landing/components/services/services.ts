import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  signal,
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
  @ViewChild('servicesSection')
  private servicesSection?: ElementRef<HTMLElement>;

  readonly isPlaying = signal(false);

  readonly services = [
    {
      number: '01',
      name: 'Limpieza dental',
      description: 'Eliminamos placa y sarro para mantener una sonrisa saludable.',
      icon: 'cleaning',
    },
    {
      number: '02',
      name: 'Resinas dentales',
      description: 'Restauraciones estéticas para recuperar la apariencia natural.',
      icon: 'resin',
    },
    {
      number: '03',
      name: 'Blanqueamiento dental',
      description: 'Mejora el tono de tus dientes con tratamientos seguros.',
      icon: 'whitening',
    },
    {
      number: '04',
      name: 'Tratamientos de conductos',
      description: 'Soluciones profesionales para conservar tus piezas dentales.',
      icon: 'root',
    },
    {
      number: '05',
      name: 'Implantes dentales',
      description: 'Recupera función y estética con tecnología especializada.',
      icon: 'implant',
    },
    {
      number: '06',
      name: 'Prótesis dentales',
      description: 'Alternativas personalizadas para devolver seguridad al sonreír.',
      icon: 'prosthesis',
    },
  ];

  private lastScrollY = 0;
  private hasPlayed = false;
  private frameRequest: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.lastScrollY = window.scrollY;

    window.addEventListener('scroll', this.onScroll, {
      passive: true,
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.removeEventListener('scroll', this.onScroll);

    if (this.frameRequest !== null) {
      cancelAnimationFrame(this.frameRequest);
    }
  }

  private onScroll = (): void => {
    if (this.frameRequest !== null) {
      return;
    }

    this.frameRequest = requestAnimationFrame(() => {
      this.frameRequest = null;
      this.checkScrollPosition();
    });
  };

  private checkScrollPosition(): void {
    const section = this.servicesSection?.nativeElement;

    if (!section) {
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > this.lastScrollY;

    this.lastScrollY = currentScrollY;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    /*
      Si regresas por encima de la sección,
      la animación queda lista para reproducirse otra vez.
    */
    if (rect.top > viewportHeight * 0.95) {
      this.hasPlayed = false;
      this.isPlaying.set(false);
      return;
    }

    /*
      La animación empieza cuando Servicios entra
      en una zona visible de la pantalla.
    */
    const sectionIsVisible =
      rect.top < viewportHeight * 0.75 &&
      rect.bottom > viewportHeight * 0.2;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (
      scrollingDown &&
      sectionIsVisible &&
      !this.hasPlayed &&
      !reducedMotion
    ) {
      this.hasPlayed = true;
      this.isPlaying.set(true);
    }
  }
}