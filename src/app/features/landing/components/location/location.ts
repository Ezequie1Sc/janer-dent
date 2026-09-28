import { 
  Component,
  AfterViewInit,
  inject,
  ElementRef,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';



@Component({

  selector: 'app-location',

  standalone: true,

  imports: [],

  templateUrl: './location.html',

  styleUrl: './location.scss'

})


export class Location implements AfterViewInit {



  private element = inject(ElementRef);

  private platformId = inject(PLATFORM_ID);





  schedules = [


    {

      day:'Lunes a Viernes',

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







  ngAfterViewInit(): void {


    if(!isPlatformBrowser(this.platformId)){

      return;

    }



    const section = 
    this.element.nativeElement.querySelector(
      '.location-section'
    );



    if(!section){

      return;

    }





    const observer = new IntersectionObserver(


      (entries)=>{


        entries.forEach(entry=>{


          if(entry.isIntersecting){


            section.classList.add('active');


          }


          else{


            section.classList.remove('active');


          }


        });


      },


      {

        threshold:0.20

      }



    );





    observer.observe(section);



  }



}