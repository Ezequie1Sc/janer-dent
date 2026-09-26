import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {

  services = [
    {
      number: '01',
      name: 'Limpieza dental',
      description: 'Eliminamos placa y sarro para mantener una sonrisa saludable.',
      icon: '🦷'
    },
    {
      number: '02',
      name: 'Resinas dentales',
      description: 'Restauraciones estéticas para recuperar la apariencia natural.',
      icon: '✨'
    },
    {
      number: '03',
      name: 'Blanqueamiento dental',
      description: 'Mejora el tono de tus dientes con tratamientos seguros.',
      icon: '😁'
    },
    {
      number: '04',
      name: 'Tratamientos de conductos',
      description: 'Soluciones profesionales para conservar tus piezas dentales.',
      icon: '◉'
    },
    {
      number: '05',
      name: 'Implantes dentales',
      description: 'Recupera función y estética con tecnología especializada.',
      icon: '⚙'
    },
    {
      number: '06',
      name: 'Prótesis dentales',
      description: 'Alternativas personalizadas para devolver seguridad al sonreír.',
      icon: '◌'
    }
  ];
}