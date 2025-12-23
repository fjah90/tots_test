import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

// Services
import { ReservationsService } from '../../../../core/services/reservations.service';
import { Reservation } from '../../../../shared/interfaces';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-10 px-6">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold mb-2">Mis Reservaciones</h1>
          <p class="text-teal-100">Gestiona todas tus reservaciones de espacios</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8 -mt-6">
        <p-card>
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
              <p-select 
                [options]="statusOptions" 
                [(ngModel)]="selectedStatus"
                (onChange)="loadReservations()"
                placeholder="Todos los estados"
                [showClear]="true"
                styleClass="w-full">
              </p-select>
            </div>
            <div class="flex items-end">
              <p-button 
                label="Actualizar" 
                icon="pi pi-refresh" 
                severity="secondary"
                [outlined]="true"
                (onClick)="loadReservations()"
              />
            </div>
          </div>

          <!-- Loading state -->
          @if (loading()) {
            <div class="flex justify-center items-center py-20">
              <p-progressSpinner strokeWidth="4" />
            </div>
          } @else if (reservations().length === 0) {
            <!-- Empty state -->
            <div class="text-center py-16">
              <i class="pi pi-calendar-times text-6xl text-gray-300 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-600 mb-2">No tienes reservaciones</h3>
              <p class="text-gray-500 mb-6">Aún no has realizado ninguna reservación de espacios</p>
              <p-button 
                label="Explorar Espacios" 
                icon="pi pi-search"
                routerLink="/spaces"
              />
            </div>
          } @else {
            <!-- Tabla de reservaciones -->
            <p-table 
              [value]="reservations()" 
              [paginator]="true" 
              [rows]="10"
              [rowsPerPageOptions]="[5, 10, 25]"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reservaciones"
              [globalFilterFields]="['space.name', 'status']"
              styleClass="p-datatable-striped"
              responsiveLayout="scroll">
              
              <!-- Columna: Espacio -->
              <ng-template pTemplate="header">
                <tr>
                  <th pSortableColumn="space.name">
                    Espacio <p-sortIcon field="space.name" />
                  </th>
                  <th pSortableColumn="start_time">
                    Fecha <p-sortIcon field="start_time" />
                  </th>
                  <th>Horario</th>
                  <th pSortableColumn="status">
                    Estado <p-sortIcon field="status" />
                  </th>
                  <th>Acciones</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-reservation>
                <tr>
                  <!-- Espacio -->
                  <td>
                    <div class="flex items-center gap-3">
                      @if (reservation.space?.image_url) {
                        <img 
                          [src]="reservation.space.image_url" 
                          [alt]="reservation.space.name"
                          class="w-12 h-12 rounded-lg object-cover"
                        />
                      } @else {
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center">
                          <i class="pi pi-building text-white"></i>
                        </div>
                      }
                      <div>
                        <a [routerLink]="['/spaces', reservation.space_id]" 
                           class="font-semibold text-gray-800 hover:text-primary transition-colors">
                          {{ reservation.space?.name || 'Espacio #' + reservation.space_id }}
                        </a>
                        @if (reservation.space?.location) {
                          <p class="text-sm text-gray-500">
                            <i class="pi pi-map-marker mr-1"></i>
                            {{ reservation.space.location }}
                          </p>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Fecha -->
                  <td>
                    <span class="font-medium">
                      {{ reservation.start_time | date:'EEEE, d MMM yyyy':'':'es' }}
                    </span>
                  </td>

                  <!-- Horario -->
                  <td>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-clock text-gray-400"></i>
                      <span>
                        {{ reservation.start_time | date:'HH:mm' }} - 
                        {{ reservation.end_time | date:'HH:mm' }}
                      </span>
                    </div>
                  </td>

                  <!-- Estado -->
                  <td>
                    <p-tag 
                      [value]="getStatusLabel(reservation.status)"
                      [severity]="getStatusSeverity(reservation.status)"
                      [icon]="getStatusIcon(reservation.status)"
                    />
                  </td>

                  <!-- Acciones -->
                  <td>
                    <div class="flex gap-2">
                      @if (canCancel(reservation)) {
                        <p-button 
                          icon="pi pi-times" 
                          severity="danger"
                          [outlined]="true"
                          pTooltip="Cancelar reservación"
                          (onClick)="confirmCancel(reservation)"
                          size="small"
                        />
                      }
                      <p-button 
                        icon="pi pi-eye" 
                        severity="info"
                        [outlined]="true"
                        pTooltip="Ver detalles del espacio"
                        [routerLink]="['/spaces', reservation.space_id]"
                        size="small"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>

              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center py-8 text-gray-500">
                    No se encontraron reservaciones con los filtros seleccionados
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>

        <!-- Resumen de estadísticas -->
        @if (reservations().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <i class="pi pi-check text-2xl text-green-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ confirmedCount() }}</p>
                <p class="text-gray-500 text-sm">Confirmadas</p>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <i class="pi pi-clock text-2xl text-yellow-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ pendingCount() }}</p>
                <p class="text-gray-500 text-sm">Pendientes</p>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <i class="pi pi-times text-2xl text-red-600"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ cancelledCount() }}</p>
                <p class="text-gray-500 text-sm">Canceladas</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MyReservationsComponent implements OnInit {
  private reservationsService = inject(ReservationsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Confirmadas', value: 'confirmed' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Canceladas', value: 'cancelled' }
  ];

  // Computed counts
  confirmedCount = computed(() => 
    this.reservations().filter(r => r.status === 'confirmed').length
  );
  pendingCount = computed(() => 
    this.reservations().filter(r => r.status === 'pending').length
  );
  cancelledCount = computed(() => 
    this.reservations().filter(r => r.status === 'cancelled').length
  );

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.reservationsService.getMyReservations(filters).subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las reservaciones'
        });
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      confirmed: 'success',
      pending: 'warn',
      cancelled: 'danger'
    };
    return severities[status] || 'secondary';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      confirmed: 'pi pi-check',
      pending: 'pi pi-clock',
      cancelled: 'pi pi-times'
    };
    return icons[status] || 'pi pi-question';
  }

  canCancel(reservation: Reservation): boolean {
    // Solo se puede cancelar si la fecha es futura y no está cancelada
    if (reservation.status === 'cancelled') return false;
    const startTime = new Date(reservation.start_time);
    return startTime > new Date();
  }

  confirmCancel(reservation: Reservation): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cancelar esta reservación?',
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelReservation(reservation.id)
    });
  }

  private cancelReservation(id: number): void {
    this.reservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cancelada',
          detail: 'La reservación ha sido cancelada exitosamente'
        });
        this.loadReservations();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cancelar la reservación'
        });
      }
    });
  }
}
