import { Component, signal } from '@angular/core';

interface DentalComparison {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  before: string;
  after: string;
  portrait: boolean;
  position: number;
  ratio: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  readonly comparisons = signal<DentalComparison[]>([
    {
      id: 'blanqueamiento',
      number: '01',
      category: 'Estética dental',
      title: 'Una sonrisa más luminosa.',
      description:
        'Explora el cambio de tonalidad antes y después del blanqueamiento dental.',
      before:
        'assets/gallery/blanqueadura/janerdent-blanqueamiento-antes-completa.webp',
      after:
        'assets/gallery/blanqueadura/janerdent-blanqueamiento-despues-completa.webp',
      portrait: false,
      position: 50,
      ratio: '16 / 10',
    },
    {
      id: 'dentadura',
      number: '02',
      category: 'Rehabilitación dental',
      title: 'Un cambio que se ve.',
      description:
        'Observa los detalles de la dentadura antes y después del tratamiento.',
      before:
        'assets/gallery/dentadura/antes-janerdent.webp',
      after:
        'assets/gallery/dentadura/despues-janerdent.webp',
      portrait: true,
      position: 50,
      ratio: '3 / 4',
    },
  ]);

  private activePointer: number | null = null;

  setPosition(id: string, value: number): void {
    const position = Math.round(
      Math.min(100, Math.max(0, value)),
    );

    this.comparisons.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, position } : item,
      ),
    );
  }

  setImageRatio(event: Event, id: string): void {
    const image = event.currentTarget as HTMLImageElement;

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const ratio = `${image.naturalWidth} / ${image.naturalHeight}`;

    this.comparisons.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, ratio } : item,
      ),
    );
  }

  startDrag(event: PointerEvent, id: string): void {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const element = event.currentTarget as HTMLElement;

    this.activePointer = event.pointerId;
    element.setPointerCapture(event.pointerId);
    element.focus({ preventScroll: true });

    this.updateFromPointer(event, id);
  }

  moveDrag(event: PointerEvent, id: string): void {
    if (this.activePointer !== event.pointerId) {
      return;
    }

    this.updateFromPointer(event, id);
  }

  endDrag(event: PointerEvent): void {
    if (this.activePointer !== event.pointerId) {
      return;
    }

    const element = event.currentTarget as HTMLElement;

    this.activePointer = null;

    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  }

  cancelDrag(): void {
    this.activePointer = null;
  }

  onKeydown(event: KeyboardEvent, id: string): void {
    const item = this.comparisons().find(
      (comparison) => comparison.id === id,
    );

    if (!item) {
      return;
    }

    const step = event.shiftKey ? 10 : 2;
    let nextPosition = item.position;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        nextPosition -= step;
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        nextPosition += step;
        break;

      case 'Home':
        nextPosition = 0;
        break;

      case 'End':
        nextPosition = 100;
        break;

      default:
        return;
    }

    event.preventDefault();
    this.setPosition(id, nextPosition);
  }

  private updateFromPointer(
    event: PointerEvent,
    id: string,
  ): void {
    const element = event.currentTarget as HTMLElement;
    const bounds = element.getBoundingClientRect();

    if (bounds.width <= 0) {
      return;
    }

    const position =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    this.setPosition(id, position);
  }
}