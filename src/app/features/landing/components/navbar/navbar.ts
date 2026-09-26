import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  menuOpen = signal(false);
  scrolled = signal(false);

  navItems = [
    { name: 'Inicio', link: '#inicio' },
    { name: 'Servicios', link: '#servicios' },
    { name: 'Nosotros', link: '#nosotros' },
    { name: 'Galería', link: '#galeria' },
    { name: 'Ubicación', link: '#ubicacion' },
    { name: 'Contacto', link: '#contacto' }
  ];


  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }


  toggleMenu() {
    this.menuOpen.update(value => !value);
  }


  closeMenu() {
    this.menuOpen.set(false);
  }
}