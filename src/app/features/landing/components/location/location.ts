import { Component } from '@angular/core';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class Location {
  readonly mapsUrl =
    'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';
}