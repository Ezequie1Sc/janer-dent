import { Component } from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [],
  templateUrl: './benefits.html',
  styleUrl: './benefits.scss',
})
export class Benefits {

  benefits = [
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

}