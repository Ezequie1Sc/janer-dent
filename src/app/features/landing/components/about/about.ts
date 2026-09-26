import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {

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

}