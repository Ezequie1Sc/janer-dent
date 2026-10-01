import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [],
  templateUrl: './benefits.html',
  styleUrl: './benefits.scss'
})
export class Benefits implements AfterViewInit, OnDestroy {

  @ViewChild('benefitsSection')
  benefitsSection?: ElementRef<HTMLElement>;


  // =========================================
  // BENEFICIOS
  // =========================================

  readonly benefits = [
    {
      number: '01',
      title: 'Atención personalizada',
      description:
        'Cada tratamiento es diseñado pensando en las necesidades de cada paciente.'
    },
    {
      number: '02',
      title: 'Tecnología avanzada',
      description:
        'Utilizamos herramientas y técnicas actuales para ofrecer mejores resultados.'
    },
    {
      number: '03',
      title: 'Experiencia profesional',
      description:
        'Conocimiento y preparación para brindar tratamientos seguros y de calidad.'
    },
    {
      number: '04',
      title: 'Trato humano',
      description:
        'Creamos un ambiente cómodo basado en confianza, respeto y cercanía.'
    },
    {
      number: '05',
      title: 'Calidad',
      description:
        'Cuidamos cada detalle para ofrecer una experiencia odontológica superior.'
    },
    {
      number: '06',
      title: 'Seguridad',
      description:
        'Procesos profesionales enfocados en el bienestar de cada paciente.'
    }
  ];


  // =========================================
  // OBSERVER
  // =========================================

  private observer?: IntersectionObserver;


  // =========================================
  // INIT
  // =========================================

  ngAfterViewInit(): void {

    if (typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.setupScrollAnimation();
  }


  // =========================================
  // SCROLL ANIMATION
  // =========================================

  private setupScrollAnimation(): void {

    const section =
      this.benefitsSection?.nativeElement;

    if (!section) {
      return;
    }


    const items =
      section.querySelectorAll<HTMLElement>(
        '.benefit-item'
      );

    if (!items.length) {
      return;
    }


    this.observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            const element =
              entry.target as HTMLElement;

            element.classList.add(
              'is-visible'
            );

            this.observer?.unobserve(
              element
            );

          });

        },
        {
          threshold: 0.12,

          rootMargin:
            '0px 0px -70px 0px'
        }
      );


    items.forEach(
      (item: HTMLElement) => {

        this.observer?.observe(item);

      }
    );
  }


  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    this.observer?.disconnect();

  }
}