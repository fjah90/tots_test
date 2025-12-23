import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { ReservationsService } from '../../../../core/services/reservations.service';
import { Reservation } from '../../../../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold">Administrar Reservaciones</h1>
          <p class="text-purple-100 mt-1">Gestiona todas las reservaciones del sistema</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8 -mt-6">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <p-select 
                [options]="statusOptions" 
                [(ngModel)]="selectedStatus"
                (onChange)="loadReservations()"
                placeholder="Todos"
                [showClear]="true"
                styleClass="w-full">
              </p-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <p-datepicker 
                [(ngModel)]="fromDate"
                (onSelect)="loadReservations()"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                styleClass="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <p-datepicker 
                [(ngModel)]="toDate"
                (onSelect)="loadReservations()"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                styleClass="w-full"
              />
            </div>
            <div class="flex items-end gap-2">
              <p-button 
                label="Buscar" 
                icon="pi pi-search" 
                (onClick)="loadReservations()"
              />
              <p-button 
                label="Limpiar" 
                icon="pi pi-times" 
                severity="secondary"
                [outlined]="true"
                (onClick)="clearFilters()"
              />
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white rounded-lg shadow">
          <p-table 
            [value]="reservations()" 
            [loading]="loading()"
            [paginator]="true" 
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reservaciones"
            styleClass="p-datatable-striped"
            responsiveLayout="scroll">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
                <th pSortableColumn="user.name">Usuario <p-sortIcon field="user.name" /></th>
                <th pSortableColumn="space.name">Espacio <p-sortIcon field="space.name" /></th>
                <th pSortableColumn="start_time">Fecha <p-sortIcon field="start_time" /></th>
                <th>Horario</th>
                <th pSortableColumn="status">Estado <p-sortIcon field="status" /></th>
                <th>Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-reservation>
              <tr>
                <td class="font-mono text-sm">#{{ reservation.id }}</td>
                
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-sm font-medium">
                        {{ reservation.user?.name?.charAt(0)?.toUpperCase() || '?' }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ reservation.user?.name || 'Usuario #' + reservation.user_id }}</p>
                      <p class="text-xs text-gray-500">{{ reservation.user?.email }}</p>
                    </div>
                  </div>
                </td>

                <td>
                  <a [routerLink]="['/spaces', reservation.space_id]" 
                     class="text-primary hover:underline font-medium">
                    {{ reservation.space?.name || 'Espacio #' + reservation.space_id }}
                  </a>
                </td>

                <td>
                  {{ reservation.start_time | date:'dd/MM/yyyy' }}
                </td>

                <td>
                  <span class="flex items-center gap-1">
                    <i class="pi pi-clock text-gray-400"></i>
                    {{ reservation.start_time | date:'HH:mm' }} - {{ reservation.end_time | date:'HH:mm' }}
                  </span>
                </td>

                <td>
                  <p-tag 
                    [value]="getStatusLabel(reservation.status)"
                    [severity]="getStatusSeverity(reservation.status)"
                  />
                </td>

                <td>
                  <div class="flex gap-1">
                    @if (reservation.status === 'pending') {
                      <p-button 
                        icon="pi pi-check" 
                        severity="success"
                        [text]="true"
                        pTooltip="Confirmar"
                        (onClick)="confirmReservation(reservation)"
                        size="small"
                      />
                    }
                    @if (reservation.status !== 'cancelled') {
                      <p-button 
                        icon="pi pi-times" 
                        severity="danger"
                        [text]="true"
                        pTooltip="Cancelar"
                        (onClick)="cancelReservation(reservation)"
                        size="small"
                      />
                    }
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center py-12 text-gray-500">
                  <i class="pi pi-calendar-times text-4xl mb-4"></i>
                  <p>No se encontraron reservaciones</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="pi pi-list text-blue-600"></i>
            </div>
            <div>
              <p class="text-xl font-bold">{{ reservations().length }}</p>
              <p class="text-gray-500 text-sm">Total</p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i class="pi pi-check text-green-600"></i>
            </div>
            <div>
              <p class="text-xl font-bold">{{ confirmedCount() }}</p>
              <p class="text-gray-500 text-sm">Confirmadas</p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <i class="pi pi-clock text-yellow-600"></i>
            </div>
            <div>
              <p class="text-xl font-bold">{{ pendingCount() }}</p>
              <p class="text-gray-500 text-sm">Pendientes</p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i class="pi pi-times text-red-600"></i>
            </div>
            <div>
              <p class="text-xl font-bold">{{ cancelledCount() }}</p>
              <p class="text-gray-500 text-sm">Canceladas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminReservationsComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  
  selectedStatus: string | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  statusOptions = [
    { label: 'Confirmadas', value: 'confirmed' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Canceladas', value: 'cancelled' }
  ];

  confirmedCount = computed(() => this.reservations().filter(r => r.status === 'confirmed').length);
  pendingCount = computed(() => this.reservations().filter(r => r.status === 'pending').length);
  cancelledCount = computed(() => this.reservations().filter(r => r.status === 'cancelled').length);

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    
    let url = `${environment.apiUrl}/admin/reservations`;
    const params = new URLSearchParams();
    
    if (this.selectedStatus) params.append('status', this.selectedStatus);
    if (this.fromDate) params.append('from_date', this.fromDate.toISOString().split('T')[0]);
    if (this.toDate) params.append('to_date', this.toDate.toISOString().split('T')[0]);
    
    if (params.toString()) url += '?' + params.toString();

    this.http.get<{ data: Reservation[] }>(url).subscribe({
      next: (res) => {
        this.reservations.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las reservaciones'
        });
      }
    });
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.fromDate = null;
    this.toDate = null;
    this.loadReservations();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'warn' | 'danger'> = {
      confirmed: 'success',
      pending: 'warn',
      cancelled: 'danger'
    };
    return severities[status] || 'warn';
  }

  confirmReservation(reservation: Reservation): void {
    this.confirmationService.confirm({
      message: '¿Confirmar esta reservación?',
      header: 'Confirmar',
      icon: 'pi pi-check',
      accept: () => {
        this.http.patch(`${environment.apiUrl}/reservations/${reservation.id}`, { status: 'confirmed' })
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reservación confirmada' });
              this.loadReservations();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar' });
            }
          });
      }
    });
  }

  cancelReservation(reservation: Reservation): void {
    this.confirmationService.confirm({
      message: '¿Cancelar esta reservación?',
      header: 'Cancelar',
      icon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.http.patch(`${environment.apiUrl}/reservations/${reservation.id}/cancel`, {})
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reservación cancelada' });
              this.loadReservations();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar' });
            }
          });
      }
    });
  }
}
