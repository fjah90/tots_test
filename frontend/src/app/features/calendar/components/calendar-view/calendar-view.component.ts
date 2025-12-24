import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

// Services
import { SpacesService } from '../../../../core/services/spaces.service';
import { ReservationsService } from '../../../../core/services/reservations.service';
import { Space, Reservation } from '../../../../shared/interfaces';

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
    spaceName: string;
    spaceId: number;
  };
}

interface SpaceOption {
  label: string;
  value: number | null;
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    SelectModule,
    ToastModule,
    ProgressSpinnerModule,
    TagModule,
    FullCalendarModule,
  ],
  providers: [MessageService],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {
  private router = inject(Router);
  private spacesService = inject(SpacesService);
  private reservationsService = inject(ReservationsService);
  private messageService = inject(MessageService);

  // Estado
  spaces = signal<Space[]>([]);
  allReservations = signal<Reservation[]>([]);
  selectedSpaceId = signal<number | null>(null);
  loading = signal(true);
  loadingReservations = signal(false);

  // Opciones del selector de espacios
  spaceOptions = computed<SpaceOption[]>(() => {
    const options: SpaceOption[] = [
      { label: 'Todos los espacios', value: null }
    ];
    this.spaces().forEach(space => {
      options.push({ label: space.name, value: space.id });
    });
    return options;
  });

  // Eventos filtrados por espacio seleccionado
  filteredEvents = computed(() => {
    const reservations = this.allReservations();
    const spaceId = this.selectedSpaceId();
    
    const filtered = spaceId 
      ? reservations.filter(r => r.space_id === spaceId)
      : reservations;
    
    return this.mapReservationsToEvents(filtered);
  });

  // Opciones del calendario
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
    selectable: false,
    dayMaxEvents: true,
    locale: esLocale,
    height: 'auto',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this),
  });

  ngOnInit(): void {
    this.loadSpaces();
    this.loadAllReservations();
  }

  loadSpaces(): void {
    this.spacesService.getSpaces({ per_page: 1000 }).subscribe({
      next: (spaces: Space[]) => {
        this.spaces.set(spaces);
      },
      error: (err: any) => {
        console.error('Error loading spaces:', err);
      }
    });
  }

  loadAllReservations(): void {
    this.loading.set(true);
    
    // Usar endpoint público para obtener reservaciones del calendario
    this.reservationsService.getCalendarReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.allReservations.set(reservations);
        this.updateCalendarEvents();
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading reservations:', err);
        this.loading.set(false);
      }
    });
  }

  onSpaceChange(event: any): void {
    this.selectedSpaceId.set(event.value);
    this.updateCalendarEvents();
  }

  private updateCalendarEvents(): void {
    const events = this.filteredEvents();
    this.calendarOptions.update(options => ({
      ...options,
      events: events
    }));
  }

  private mapReservationsToEvents(reservations: Reservation[]): CalendarEvent[] {
    return reservations.map(reservation => {
      const space = this.spaces().find(s => s.id === reservation.space_id);
      
      // Colores según estado (consistente con la leyenda)
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
        title: space?.name || `Espacio #${reservation.space_id}`,
        start: reservation.start_time,
        end: reservation.end_time,
        backgroundColor,
        borderColor,
        textColor: '#ffffff',
        extendedProps: {
          status: reservation.status,
          spaceName: space?.name || 'Desconocido',
          spaceId: reservation.space_id
        }
      };
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
    const spaceName = event.extendedProps?.spaceName || event.title;
    
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
    
    const tooltipText = `${spaceName}\n${dateStr}\n${startTime} - ${endTime}\nEstado: ${statusLabels[status] || status}`;
    
    // Agregar atributo title para tooltip nativo
    info.el.setAttribute('title', tooltipText);
    info.el.style.cursor = 'pointer';
  }

  handleEventClick(clickInfo: any): void {
    const props = clickInfo.event.extendedProps;
    const spaceId = props?.spaceId;
    
    if (spaceId) {
      // Navegar al detalle del espacio
      this.router.navigate(['/spaces', spaceId]);
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
