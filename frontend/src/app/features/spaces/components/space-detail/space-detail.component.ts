import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

// Services & Components
import { SpacesService } from '../../../../core/services/spaces.service';
import { ReservationsService } from '../../../../core/services/reservations.service';
import { Space, Reservation } from '../../../../shared/interfaces';
import { ReservationFormComponent } from '../reservation-form/reservation-form.component';

// Interface para eventos de FullCalendar
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps?: {
    status: string;
    reservationId: number;
  };
}

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    DialogModule,
    ToastModule,
    ProgressSpinnerModule,
    ReservationFormComponent,
    FullCalendarModule,
  ],
  providers: [MessageService],
  templateUrl: './space-detail.component.html',
  styleUrl: './space-detail.component.scss'
})
export class SpaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spacesService = inject(SpacesService);
  private reservationsService = inject(ReservationsService);
  private messageService = inject(MessageService);

  // Estado
  space = signal<Space | null>(null);
  reservations = signal<Reservation[]>([]);
  calendarEvents = signal<CalendarEvent[]>([]);
  loading = signal(true);
  loadingReservations = signal(false);

  // Modal
  showReservationDialog = false;
  selectedDate: Date | null = null;

  // FullCalendar Options
  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    locale: esLocale,
    height: 'auto',
    events: [],
  });

  ngOnInit(): void {
    // Configurar handlers del calendario después de la inicialización
    this.calendarOptions.update(options => ({
      ...options,
      select: this.handleDateSelect.bind(this),
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDidMount: this.handleEventDidMount.bind(this),
    }));

    const spaceId = this.route.snapshot.paramMap.get('id');
    if (spaceId) {
      this.loadSpace(+spaceId);
      this.loadReservations(+spaceId);
    } else {
      this.router.navigate(['/spaces']);
    }
  }

  loadSpace(id: number): void {
    this.loading.set(true);
    this.spacesService.getSpace(id).subscribe({
      next: (space) => {
        this.space.set(space);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading space:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el espacio'
        });
        this.loading.set(false);
        this.router.navigate(['/spaces']);
      }
    });
  }

  loadReservations(spaceId: number): void {
    this.loadingReservations.set(true);
    
    // Obtener reservaciones del próximo mes
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 1);

    this.reservationsService.getSpaceReservations(
      spaceId,
      this.formatDate(fromDate),
      this.formatDate(toDate)
    ).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        const events = this.mapReservationsToEvents(reservations);
        this.calendarEvents.set(events);
        // Actualizar eventos en el calendario
        this.calendarOptions.update(options => ({
          ...options,
          events: events
        }));
        this.loadingReservations.set(false);
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.loadingReservations.set(false);
      }
    });
  }

  /**
   * Configura tooltip para eventos del calendario
   */
  private handleEventDidMount(info: any): void {
    const event = info.event;
    const startDate = event.start;
    const endDate = event.end;
    const status = event.extendedProps?.status || 'pending';
    
    // Formatear fecha y hora
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    
    const dateStr = startDate.toLocaleDateString('es-ES', dateOptions);
    const startTime = startDate.toLocaleTimeString('es-ES', timeOptions);
    const endTime = endDate ? endDate.toLocaleTimeString('es-ES', timeOptions) : '';
    
    const statusLabels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada'
    };
    
    const tooltipText = `${dateStr}\n${startTime} - ${endTime}\nEstado: ${statusLabels[status] || status}`;
    
    // Agregar atributo title para tooltip nativo
    info.el.setAttribute('title', tooltipText);
    info.el.style.cursor = 'pointer';
  }

  /**
   * Mapea reservaciones a eventos de FullCalendar
   * Colores consistentes con la página de calendario
   */
  private mapReservationsToEvents(reservations: Reservation[]): CalendarEvent[] {
    return reservations.map(reservation => {
      // Colores según estado (consistente con /calendar)
      let backgroundColor: string;
      let borderColor: string;
      
      switch (reservation.status) {
        case 'confirmed':
          backgroundColor = '#14b8a6'; // Teal
          borderColor = '#0d9488';
          break;
        case 'pending':
          backgroundColor = '#fbbf24'; // Amarillo
          borderColor = '#f59e0b';
          break;
        case 'cancelled':
          backgroundColor = '#9ca3af'; // Gris
          borderColor = '#6b7280';
          break;
        default:
          backgroundColor = '#14b8a6';
          borderColor = '#0d9488';
      }

      return {
        id: reservation.id.toString(),
        title: reservation.notes || 'Reservado',
        start: reservation.start_time,
        end: reservation.end_time,
        backgroundColor,
        borderColor,
        textColor: '#ffffff',
        extendedProps: {
          status: reservation.status,
          reservationId: reservation.id
        }
      };
    });
  }

  openReservationModal(): void {
    this.showReservationDialog = true;
  }

  closeReservationModal(): void {
    this.showReservationDialog = false;
  }

  onReservationSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Reservación Creada',
      detail: '¡Tu reservación ha sido registrada exitosamente!'
    });
    this.closeReservationModal();
    // Recargar reservaciones para actualizar calendario
    if (this.space()) {
      this.loadReservations(this.space()!.id);
    }
  }

  onReservationError(error: any): void {
    if (error.status === 409) {
      this.messageService.add({
        severity: 'error',
        summary: 'Espacio Ocupado',
        detail: 'El espacio ya está ocupado en ese horario.'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al crear la reservación.'
      });
    }
  }

  // Handlers para FullCalendar
  handleDateSelect(selectInfo: any): void {
    // Abrir modal de reservación con fecha preseleccionada
    this.openReservationModal();
  }

  handleDateClick(arg: any): void {
    // Solo abrir modal si el clic NO fue en un evento
    // El evento tiene su propio handler (eventClick)
    // jsEvent.target nos permite verificar si se hizo clic en un evento
    const target = arg.jsEvent?.target as HTMLElement;
    if (target && target.closest('.fc-event')) {
      // Se hizo clic en un evento, no abrir el modal
      return;
    }
    // Guardar la fecha seleccionada y abrir modal de reservación
    this.selectedDate = arg.date;
    this.openReservationModal();
  }

  handleEventClick(clickInfo: any): void {
    // Detener propagación para evitar que también se dispare dateClick
    clickInfo.jsEvent?.stopPropagation();
    
    // Mostrar detalles de la reservación
    const status = clickInfo.event.extendedProps?.status;
    const title = clickInfo.event.title;
    this.messageService.add({
      severity: status === 'cancelled' ? 'warn' : 'info',
      summary: 'Reservación',
      detail: `${title} - Estado: ${this.getStatusLabel(status)}`
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }
}
