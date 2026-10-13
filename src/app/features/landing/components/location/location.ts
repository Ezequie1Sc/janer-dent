import { Component } from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class Location {
  readonly mapsUrl = 'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';

  readonly mapEmbedUrl: SafeResourceUrl;

  constructor(private readonly sanitizer: DomSanitizer) {
    const embedUrl =
      'https://maps.google.com/maps?q=Hecelchak%C3%A1n%2C%20Campeche&z=15&output=embed';

    this.mapEmbedUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}