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


  readonly benefits = [

    {
      number: '01',
      title: 'Atención personalizada',
      description:
        'Cada tratamiento es diseñado pensando en las necesidades y objetivos de cada paciente.'
    },

    {
      number: '02',
      title: 'Tecnología avanzada',
      description:
        'Utilizamos herramientas y técnicas actuales para ofrecer diagnósticos precisos y tratamientos más efectivos.'
    },

    {
      number: '03',
      title: 'Experiencia profesional',
      description:
        'Contamos con un equipo capacitado y en constante actualización para brindarte la mejor atención.'
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
        'Seguimos protocolos estrictos de higiene y esterilización para proteger tu salud en cada visita.'
    }

  ];


  private observer?: IntersectionObserver;


  ngAfterViewInit(): void {

    if (typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.setupScrollAnimation();
  }


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

            element.classList.add('is-visible');

            this.observer?.unobserve(element);

          });

        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -50px 0px'
        }
      );


    items.forEach((item) => {
      this.observer?.observe(item);
    });

  }


  ngOnDestroy(): void {

    this.observer?.disconnect();

  }

}