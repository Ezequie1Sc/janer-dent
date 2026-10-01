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
   * URL oficial de Google Maps utilizado
   * por todos los enlaces relacionados con la ubicación.
   */
  readonly mapsUrl =
    'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';

  /**
   * Horarios de atención del consultorio.
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