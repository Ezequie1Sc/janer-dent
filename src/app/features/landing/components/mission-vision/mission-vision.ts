import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-mission-vision',
  standalone: true,
  imports: [],
  templateUrl: './mission-vision.html',
  styleUrl: './mission-vision.scss',
})
export class MissionVision {
  private readonly elementRef =
    inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  constructor() {
    /*
     * afterNextRender se ejecuta en el navegador.
     * Las referencias a window no se ejecutan durante SSR.
     */
    afterNextRender(() => {
      this.ngZone.runOutsideAngular(() => {
        this.setupScrollAnimation();
      });
    });
  }

  private setupScrollAnimation(): void {
    const cards = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
        '[data-essence-card]'
      )
    );

    if (!cards.length) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    let frameId: number | null = null;
    let destroyed = false;

    const clamp = (value: number): number =>
      Math.min(1, Math.max(0, value));

    const updateCards = (): void => {
      frameId = null;

      if (destroyed) {
        return;
      }

      if (reducedMotion.matches) {
        cards.forEach((card) => {
          card.style.setProperty('--card-opacity', '1');
          card.style.setProperty('--card-y', '0px');
          card.style.setProperty('--card-scale', '1');
        });

        return;
      }

      const viewportHeight = window.innerHeight;

      /*
       * La entrada ocurre en la franja inferior de la pantalla.
       * La salida ocurre cuando la tarjeta casi ha salido por arriba.
       * En el centro permanece completamente visible.
       */
      const entryDistance = Math.max(1, viewportHeight * 0.2);
      const exitDistance = Math.max(1, viewportHeight * 0.14);

      // Primero se leen las posiciones de todas las tarjetas.
      const measurements = cards.map((card) => ({
        card,
        rect: card.getBoundingClientRect(),
      }));

      // Después se actualizan sus estilos.
      measurements.forEach(({ card, rect }) => {
        const entryProgress = clamp(
          (viewportHeight - rect.top) / entryDistance
        );

        const exitProgress = clamp(
          rect.bottom / exitDistance
        );

        const visibility = Math.min(
          entryProgress,
          exitProgress
        );

        // Suavizado del progreso.
        const eased =
          visibility * visibility * (3 - 2 * visibility);

        const isEntering = entryProgress < exitProgress;
        const direction = isEntering ? 1 : -1;

        const translateY = (1 - eased) * 34 * direction;
        const scale = 0.965 + eased * 0.035;

        card.style.setProperty(
          '--card-opacity',
          eased.toFixed(3)
        );

        card.style.setProperty(
          '--card-y',
          `${translateY.toFixed(2)}px`
        );

        card.style.setProperty(
          '--card-scale',
          scale.toFixed(4)
        );
      });
    };

    const scheduleUpdate = (): void => {
      if (destroyed || frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateCards);
    };

    window.addEventListener('scroll', scheduleUpdate, {
      passive: true,
    });

    window.addEventListener('resize', scheduleUpdate, {
      passive: true,
    });

    reducedMotion.addEventListener('change', scheduleUpdate);

    scheduleUpdate();

    this.destroyRef.onDestroy(() => {
      destroyed = true;

      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);

      reducedMotion.removeEventListener(
        'change',
        scheduleUpdate
      );

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    });
  }
}