import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {


  scrollY = signal(0);


  @HostListener('window:scroll')
  onScroll(){

    this.scrollY.set(window.scrollY);

  }


  get imageTransform(){

    return `scale(${1 + this.scrollY() * 0.00015}) 
            translateY(${this.scrollY() * 0.18}px)`;

  }


  get textTransform(){

    return `translateY(-${this.scrollY() * 0.15}px)`;

  }


  get textOpacity(){

    const opacity = 1 - this.scrollY() / 600;

    return opacity < 0 ? 0 : opacity;

  }


}