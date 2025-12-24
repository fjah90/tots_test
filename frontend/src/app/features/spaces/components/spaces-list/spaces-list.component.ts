import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

// Services & Interfaces
import { SpacesService } from '../../../../core/services/spaces.service';
import { Space } from '../../../../shared/interfaces';
import { ReservationFormComponent } from '../reservation-form/reservation-form.component';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    // PrimeNG
    CardModule,
    ButtonModule,
    InputTextModule,
    SliderModule,
    DatePickerModule,
    TagModule,
    ProgressSpinnerModule,
    DividerModule,
    DialogModule,
    ToastModule,
    CarouselModule,
    TooltipModule,
    SkeletonModule,
    // Custom
    ReservationFormComponent,
  ],
  providers: [MessageService],
  templateUrl: './spaces-list.component.html',
  styleUrl: './spaces-list.component.scss',
})
export class SpacesListComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private messageService = inject(MessageService);

  // Skeleton items para loading inicial
  skeletonItems = Array(6).fill(0);

  // Estado
  spaces = signal<Space[]>([]);
  loading = signal(false);
  loadingMore = signal(false);

  // Paginación para infinite scroll
  currentPage = signal(1);
  perPage = 12; // Elementos por página
  totalItems = signal(0);
  hasMore = signal(true);

  // Filtros
  searchTerm = signal('');
  capacityRange = signal<number[]>([0, 100]);
  selectedDate = signal<Date | null>(null);
  selectedStartTime = signal<Date | null>(null);
  selectedEndTime = signal<Date | null>(null);
  minDate = new Date(); // No permitir fechas pasadas

  // Modal de reserva
  showReservationDialogVisible = false;
  selectedSpace = signal<Space | null>(null);

  // Espacios filtrados - ahora simplemente devuelve los espacios ya que el backend ya filtra
  filteredSpaces = computed(() => this.spaces());

  // Timeout para debounce de búsqueda
  private searchTimeout: any = null;

  /**
   * Detectar scroll para cargar más elementos (infinite scroll)
   */
  @HostListener('window:scroll')
  onScroll(): void {
    // Verificar si estamos cerca del final de la página
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= threshold && !this.loadingMore() && this.hasMore()) {
      this.loadMoreSpaces();
    }
  }

  ngOnInit(): void {
    this.loadSpaces();
  }

  /**
   * Formatea una fecha para enviar al backend (YYYY-MM-DD)
   */
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatear hora para la API (HH:mm)
   */
  private formatTimeForApi(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Cuando cambia la fecha seleccionada, recargar espacios
   */
  onDateChange(date: Date | null): void {
    this.selectedDate.set(date);
    this.loadSpaces();
  }

  /**
   * Cuando cambia la hora de inicio, recargar espacios
   */
  onStartTimeChange(time: Date | null): void {
    this.selectedStartTime.set(time);
    if (this.selectedDate()) {
      this.loadSpaces();
    }
  }

  /**
   * Cuando cambia la hora de fin, recargar espacios
   */
  onEndTimeChange(time: Date | null): void {
    this.selectedEndTime.set(time);
    if (this.selectedDate()) {
      this.loadSpaces();
    }
  }

  /**
   * Cuando cambia el término de búsqueda, recargar con debounce
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);

    // Cancelar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce de 400ms para no hacer muchas peticiones
    this.searchTimeout = setTimeout(() => {
      this.loadSpaces();
    }, 400);
  }

  /**
   * Cuando cambia el rango de capacidad, recargar con debounce
   */
  onCapacityChange(range: number[]): void {
    this.capacityRange.set(range);

    // Cancelar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce de 300ms para el slider
    this.searchTimeout = setTimeout(() => {
      this.loadSpaces();
    }, 300);
  }

  loadSpaces(): void {
    this.loading.set(true);
    this.currentPage.set(1);
    this.spaces.set([]);
    this.hasMore.set(true);

    const filters: any = {
      is_active: true,
      page: 1,
      per_page: this.perPage,
    };

    // Agregar filtro de búsqueda por texto
    if (this.searchTerm().trim()) {
      filters.search = this.searchTerm().trim();
    }

    // Agregar filtros de capacidad
    if (this.capacityRange()[0] > 0) {
      filters.capacity_min = this.capacityRange()[0];
    }
    if (this.capacityRange()[1] < 100) {
      filters.capacity_max = this.capacityRange()[1];
    }

    // Filtro de disponibilidad: solo aplica si hay fecha Y ambas horas seleccionadas
    if (this.selectedDate() && this.selectedStartTime() && this.selectedEndTime()) {
      filters.available_date = this.formatDateForApi(this.selectedDate()!);
      filters.available_start_time = this.formatTimeForApi(this.selectedStartTime()!);
      filters.available_end_time = this.formatTimeForApi(this.selectedEndTime()!);
      // Enviar timezone del navegador para conversión correcta en backend
      filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    this.spacesService.getSpacesPaginated(filters).subscribe({
      next: response => {
        this.spaces.set(response.data);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.hasMore.set(response.meta.current_page < response.meta.last_page);
        } else {
          this.hasMore.set(false);
        }
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading spaces:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los espacios',
        });
        this.loading.set(false);
      },
    });
  }

  /**
   * Cargar más espacios (infinite scroll)
   */
  loadMoreSpaces(): void {
    if (this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    const filters: any = {
      is_active: true,
      page: nextPage,
      per_page: this.perPage,
    };

    // Mantener filtro de búsqueda por texto
    if (this.searchTerm().trim()) {
      filters.search = this.searchTerm().trim();
    }

    // Mantener filtros de capacidad
    if (this.capacityRange()[0] > 0) {
      filters.capacity_min = this.capacityRange()[0];
    }
    if (this.capacityRange()[1] < 100) {
      filters.capacity_max = this.capacityRange()[1];
    }

    // Mantener filtro de disponibilidad si está activo
    if (this.selectedDate() && this.selectedStartTime() && this.selectedEndTime()) {
      filters.available_date = this.formatDateForApi(this.selectedDate()!);
      filters.available_start_time = this.formatTimeForApi(this.selectedStartTime()!);
      filters.available_end_time = this.formatTimeForApi(this.selectedEndTime()!);
      filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    this.spacesService.getSpacesPaginated(filters).subscribe({
      next: response => {
        // Agregar nuevos espacios a los existentes
        this.spaces.update(current => [...current, ...response.data]);
        this.currentPage.set(nextPage);

        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.hasMore.set(response.meta.current_page < response.meta.last_page);
        } else {
          this.hasMore.set(false);
        }
        this.loadingMore.set(false);
      },
      error: err => {
        console.error('Error loading more spaces:', err);
        this.loadingMore.set(false);
      },
    });
  }

  openReservationModal(space: Space): void {
    this.selectedSpace.set(space);
    this.showReservationDialogVisible = true;
  }

  closeReservationModal(): void {
    this.showReservationDialogVisible = false;
    this.selectedSpace.set(null);
  }

  onReservationSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Reservación Creada',
      detail: '¡Tu reservación ha sido registrada exitosamente!',
    });
    this.closeReservationModal();
  }

  onReservationError(error: any): void {
    // Manejo específico del error 409 (Conflicto/Ocupado)
    if (error.status === 409) {
      this.messageService.add({
        severity: 'error',
        summary: 'Espacio Ocupado',
        detail: 'El espacio ya está ocupado en ese horario. Por favor selecciona otro horario.',
      });
    } else if (error.status === 422) {
      // Errores de validación
      const message = error.error?.message || 'Por favor verifica los datos ingresados';
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos Inválidos',
        detail: message,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al crear la reservación. Intenta nuevamente.',
      });
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.capacityRange.set([0, 100]);
    this.selectedDate.set(null);
    this.selectedStartTime.set(null);
    this.selectedEndTime.set(null);
    this.loadSpaces();
  }

  getCapacityIcon(capacity: number): string {
    if (capacity <= 5) return 'pi pi-user';
    if (capacity <= 20) return 'pi pi-users';
    return 'pi pi-building';
  }

  /**
   * Obtener imágenes del espacio para el carousel
   * Prioriza el array 'images', luego 'image_url', o retorna array vacío
   */
  getSpaceImages(space: Space): string[] {
    if (space.images && space.images.length > 0) {
      return space.images;
    }
    if (space.image_url) {
      return [space.image_url];
    }
    return [];
  }

  /**
   * Verificar si el espacio tiene múltiples imágenes
   */
  hasMultipleImages(space: Space): boolean {
    return this.getSpaceImages(space).length > 1;
  }
}
