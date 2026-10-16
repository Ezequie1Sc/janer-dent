import { Component } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { Services } from '../../components/services/services';
import { MissionVision } from '../../components/mission-vision/mission-vision';
import { About } from '../../components/about/about';
import { Gallery } from '../../components/gallery/gallery';
import { Location } from '../../components/location/location';
import { Contact } from '../../components/contact/contact';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Navbar,
    Hero,
    Services,
    MissionVision,
    About,
    Gallery,
    Location,
    Contact,
    Footer,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}