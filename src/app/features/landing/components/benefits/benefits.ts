import { Component } from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [],
  templateUrl: './benefits.html',
  styleUrl: './benefits.scss'
})
export class Benefits {

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
        'Herramientas actuales para ofrecer diagnósticos precisos y tratamientos efectivos.'
    },

    {
      number: '03',
      title: 'Experiencia profesional',
      description:
        'Equipo capacitado y en constante actualización para brindarte una atención de calidad.'
    },

    {
      number: '04',
      title: 'Trato humano',
      description:
        'Un ambiente cómodo y cercano basado en confianza, respeto y atención personalizada.'
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
        'Protocolos profesionales de higiene y esterilización para proteger tu bienestar.'
    }
  ];

}