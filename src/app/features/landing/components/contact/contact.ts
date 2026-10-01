import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

interface Tratamiento {
  nombre: string;
  descripcion: string;
}

interface RelojConsultorio {
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly destroyRef = inject(DestroyRef);

  private readonly contactSection =
    viewChild<ElementRef<HTMLElement>>('contactSection');

  readonly whatsapp = '529961046096';

  private readonly zonaHoraria = 'America/Merida';

  readonly visible = signal(false);
  readonly enviado = signal(false);

  readonly nombre = signal('');
  readonly servicio = signal('');
  readonly fecha = signal('');
  readonly hora = signal('');

  readonly reloj = signal<RelojConsultorio>({
    fecha: '',
    hora: '',
  });

  readonly tratamientos: readonly Tratamiento[] = [
    {
      nombre: 'Limpieza dental',
      descripcion:
        'Eliminamos placa y sarro para cuidar la salud de tu sonrisa.',
    },
    {
      nombre: 'Resinas dentales',
      descripcion:
        'Recuperamos la apariencia natural de tus dientes.',
    },
    {
      nombre: 'Blanqueamiento dental',
      descripcion:
        'Una sonrisa más luminosa mediante un tratamiento profesional.',
    },
    {
      nombre: 'Tratamientos de conductos',
      descripcion:
        'Atención profesional para conservar tus piezas dentales.',
    },
    {
      nombre: 'Implantes dentales',
      descripcion:
        'Recupera función y estética con un plan personalizado.',
    },
    {
      nombre: 'Prótesis dentales',
      descripcion:
        'Comodidad y confianza para volver a sonreír.',
    },
  ];

  readonly tratamientoSeleccionado = computed(() =>
    this.tratamientos.find(
      (tratamiento) => tratamiento.nombre === this.servicio()
    )
  );

  readonly errorNombre = computed(() => {
    const nombre = this.nombre().trim();

    if (nombre.length < 2) {
      return 'Escribe tu nombre completo.';
    }

    if (nombre.length > 80) {
      return 'El nombre debe tener un máximo de 80 caracteres.';
    }

    return '';
  });

  readonly errorServicio = computed(() =>
    this.tratamientoSeleccionado()
      ? ''
      : 'Selecciona el tratamiento que te interesa.'
  );

  readonly errorFecha = computed(() => {
    const fecha = this.fecha();

    if (!this.esFechaValida(fecha)) {
      return 'Selecciona una fecha válida.';
    }

    const hoy = this.reloj().fecha;

    if (hoy && fecha < hoy) {
      return 'Elige hoy o una fecha posterior.';
    }

    return '';
  });

  readonly errorHora = computed(() => {
    const hora = this.hora();

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
      return 'Selecciona una hora válida.';
    }

    const ahora = this.reloj();

    if (
      this.fecha() === ahora.fecha &&
      ahora.hora &&
      hora <= ahora.hora
    ) {
      return 'Elige una hora posterior a la actual.';
    }

    return '';
  });

  readonly formularioValido = computed(
    () =>
      !this.errorNombre() &&
      !this.errorServicio() &&
      !this.errorFecha() &&
      !this.errorHora()
  );

  readonly fechaResumen = computed(() => {
    if (!this.esFechaValida(this.fecha())) {
      return 'Por elegir';
    }

    return this.formatearFecha(this.fecha());
  });

  constructor() {
    afterNextRender(() => {
      this.actualizarReloj();

      const elemento = this.contactSection()?.nativeElement;

      if (
        !elemento ||
        typeof IntersectionObserver === 'undefined'
      ) {
        this.visible.set(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.visible.set(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.08,
        }
      );

      observer.observe(elemento);

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }

  actualizarReloj(): void {
    const partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.zonaHoraria,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    const valor = (tipo: string): string =>
      partes.find((parte) => parte.type === tipo)?.value ?? '';

    this.reloj.set({
      fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
      hora: `${valor('hour')}:${valor('minute')}`,
    });
  }

  solicitarCita(): void {
    this.actualizarReloj();
    this.enviado.set(true);

    if (!this.formularioValido()) {
      return;
    }

    const nombre = this.nombre()
      .trim()
      .replace(/\s+/g, ' ');

    const mensaje = [
      'Hola, JANERDent. Quisiera solicitar una cita.',
      '',
      `Nombre: ${nombre}`,
      `Tratamiento: ${this.servicio()}`,
      `Fecha deseada: ${this.formatearFecha(this.fecha())}`,
      `Hora deseada: ${this.hora()} h (hora de Campeche)`,
      '',
      '¿Podrían confirmarme si tienen disponibilidad en esa fecha y horario?',
      'Quedo pendiente de su confirmación. Gracias.',
    ].join('\n');

    const enlace =
      `https://wa.me/${this.whatsapp}` +
      `?text=${encodeURIComponent(mensaje)}`;

    if (typeof window !== 'undefined') {
      window.location.assign(enlace);
    }
  }

  private esFechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return false;
    }

    const fecha = new Date(`${valor}T12:00:00Z`);

    return (
      Number.isFinite(fecha.getTime()) &&
      fecha.toISOString().slice(0, 10) === valor
    );
  }

  private formatearFecha(valor: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${valor}T12:00:00Z`));
  }
}