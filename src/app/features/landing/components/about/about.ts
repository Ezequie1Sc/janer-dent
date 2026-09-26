import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements AfterViewInit, OnDestroy {

  @ViewChild('aboutSection')
  section!: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  indicators = [
    {
      title: 'Atención personalizada',
      text: 'Cada paciente recibe un tratamiento adaptado a sus necesidades.'
    },
    {
      title: 'Trato humano',
      text: 'Creamos una experiencia cómoda y de confianza.'
    },
    {
      title: 'Resultados con confianza',
      text: 'Utilizamos técnicas profesionales para cuidar tu sonrisa.'
    }
  ];

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.section.nativeElement.classList.add('visible');

          // Solo necesitamos animarla una vez.
          this.observer?.unobserve(this.section.nativeElement);
        }
      },
      {
        threshold: 0.2
      }
    );

    this.observer.observe(this.section.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}