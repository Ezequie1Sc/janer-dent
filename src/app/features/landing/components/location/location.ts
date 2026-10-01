import { Component } from '@angular/core';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class Location {

  /**
   * Enlace utilizado para abrir
   * la ubicación de JANERDent.
   */
  readonly mapsUrl =
    'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';

  /**
   * Horarios de atención.
   */
  readonly schedules = [
    {
      day: 'Lunes a viernes',
      hours: [
        '8:30 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.',
      ],
    },
    {
      day: 'Sábado',
      hours: [
        '9:00 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.',
      ],
    },
  ];
}