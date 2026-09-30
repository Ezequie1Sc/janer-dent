import {
  afterNextRender,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { PLATFORM_ID, inject } from '@angular/core';


@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class Location implements OnDestroy {


  @ViewChild('mapCanvas')
  mapCanvas!: ElementRef<HTMLDivElement>;


  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);


  private map:any = null;


  readonly mapsUrl =
  'https://maps.app.goo.gl/aaNKGFfPPodFR98n6';



  readonly schedules = [

    {
      day:'Lunes a viernes',
      hours:[
        '8:30 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.'
      ]
    },

    {
      day:'Sábado',
      hours:[
        '9:00 a.m. - 1:00 p.m.',
        '5:00 p.m. - 9:00 p.m.'
      ]
    }

  ];



  constructor(){

    afterNextRender(()=>{

      if(
        isPlatformBrowser(this.platformId)
      ){

        this.zone.runOutsideAngular(()=>{

          this.loadMap();

        });

      }

    });

  }





  async loadMap(){


    try{


      const L = await import('leaflet');



      const lat = 20.1705166;
      const lng = -90.1379765;



      this.map = L.map(
        this.mapCanvas.nativeElement,
        {

          center:[
            lat,
            lng
          ],

          zoom:16,

          zoomControl:false,

          dragging:false,

          scrollWheelZoom:false,

          doubleClickZoom:false,

          attributionControl:false

        }

      );



      L.tileLayer(

        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        {

          maxZoom:19,

          attribution:
          '&copy; OpenStreetMap'

        }

      ).addTo(this.map);





      const icon = L.divIcon({

        className:
        'janer-marker-custom',


        html:`

        <div class="janer-pin">


          <div class="janer-logo">

            <img 
            src="/assets/hero/janerdent-logo.webp"
            />

          </div>


          <div class="janer-label">

            <strong>
            JANERDent
            </strong>

            <span>
            Odontología Integral
            </span>

          </div>


        </div>

        `,


        iconSize:[
          150,
          150
        ],

        iconAnchor:[
          75,
          75
        ]


      });





      L.marker(

        [
          lat,
          lng
        ],

        {
          icon:icon,
          interactive:false
        }


      )
      .addTo(this.map);





      setTimeout(()=>{

        this.map.invalidateSize();

      },500);



    }
    catch(error){

      console.error(
        'Error cargando Leaflet',
        error
      );


    }



  }




  ngOnDestroy(){

    if(this.map){

      this.map.remove();

    }

  }


}