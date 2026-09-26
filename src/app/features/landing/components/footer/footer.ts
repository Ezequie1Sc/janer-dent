import { Component } from '@angular/core';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {


  links = [

    {
      name:'Inicio',
      url:'#inicio'
    },

    {
      name:'Servicios',
      url:'#servicios'
    },

    {
      name:'Nosotros',
      url:'#nosotros'
    },

    {
      name:'Galería',
      url:'#galeria'
    },

    {
      name:'Ubicación',
      url:'#ubicacion'
    },

    {
      name:'Contacto',
      url:'#contacto'
    }

  ];



}