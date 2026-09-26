import { Component } from '@angular/core';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {


  images = [

    {
      title:'Restauraciones dentales',
      image:'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80'
    },

    {
      title:'Blanqueamiento dental',
      image:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80'
    },

    {
      title:'Tratamientos estéticos',
      image:'https://images.unsplash.com/photo-1588776814546-daab30f3109a?auto=format&fit=crop&w=900&q=80'
    },

    {
      title:'Cuidado profesional',
      image:'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=80'
    }

  ];


}