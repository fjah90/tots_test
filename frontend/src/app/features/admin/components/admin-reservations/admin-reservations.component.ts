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
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
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
    ProgressSpinnerModule,
    DialogModule,
    InputTextModule,
    InputNumberModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold">Administrar Reservaciones</h1>
          <p class="text-teal-100 mt-1">Gestiona todas las reservaciones del sistema</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8 -mt-6">
        <!-- Filtros y Botón Nueva Reserva -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 transition-colors">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
              <p-datepicker 
                [(ngModel)]="fromDate"
                (onSelect)="loadReservations()"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                styleClass="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
              <p-datepicker 
                [(ngModel)]="toDate"
                (onSelect)="loadReservations()"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                styleClass="w-full"
              />
            </div>
            <p-button 
              label="Buscar" 
              icon="pi pi-search" 
              (onClick)="loadReservations()"
            />
            <p-button 
              label="Nueva Reserva" 
              icon="pi pi-plus"
              severity="success"
              (onClick)="openNewReservationDialog()"
            />
          </div>
          <div class="mt-4">
            <p-button 
              label="Limpiar" 
              icon="pi pi-times" 
              severity="secondary"
              [outlined]="true"
              (onClick)="clearFilters()"
              [text]="true"
            />
          </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
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
                    @if (reservation.status !== 'cancelled') {
                      <p-button 
                        icon="pi pi-pencil" 
                        severity="warn"
                        [text]="true"
                        pTooltip="Editar"
                        (onClick)="editReservation(reservation)"
                        size="small"
                      />
                    }
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
                    <p-button 
                      icon="pi pi-trash" 
                      severity="danger"
                      [text]="true"
                      pTooltip="Eliminar permanentemente"
                      (onClick)="deleteReservation(reservation)"
                      size="small"
                    />
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
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 transition-colors">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <i class="pi pi-list text-blue-600 dark:text-blue-400"></i>
            </div>
            <div>
              <p class="text-xl font-bold dark:text-white">{{ reservations().length }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Total</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 transition-colors">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <i class="pi pi-check text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <p class="text-xl font-bold dark:text-white">{{ confirmedCount() }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Confirmadas</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 transition-colors">
            <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <i class="pi pi-clock text-yellow-600 dark:text-yellow-400"></i>
            </div>
            <div>
              <p class="text-xl font-bold dark:text-white">{{ pendingCount() }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Pendientes</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 transition-colors">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <i class="pi pi-times text-red-600 dark:text-red-400"></i>
            </div>
            <div>
              <p class="text-xl font-bold dark:text-white">{{ cancelledCount() }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Canceladas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Nueva/Editar Reservación -->
    <p-dialog 
      [(visible)]="showReservationDialog"
      [header]="editingReservation ? 'Editar Reservación' : 'Nueva Reservación'"
      [modal]="true"
      [style]="{ width: '500px' }"
      (onHide)="resetForm()">
      
      <div class="space-y-4">
        <!-- Usuario -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario *</label>
          <p-select 
            [(ngModel)]="formData.user_id"
            [options]="users()"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccionar usuario"
            [showClear]="false"
            styleClass="w-full">
            <ng-template let-option pTemplate="item">
              <div class="flex items-center gap-2">
                <span>{{ option.name }}</span>
                <span class="text-xs text-gray-500">({{ option.email }})</span>
              </div>
            </ng-template>
          </p-select>
        </div>

        <!-- Espacio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Espacio *</label>
          <p-select 
            [(ngModel)]="formData.space_id"
            [options]="spaces()"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccionar espacio"
            [showClear]="false"
            styleClass="w-full">
            <ng-template let-option pTemplate="item">
              <div class="flex items-center justify-between">
                <span>{{ option.name }}</span>
                <span class="text-xs text-gray-500">Cap: {{ option.capacity }}</span>
              </div>
            </ng-template>
          </p-select>
        </div>

        <!-- Fecha Inicio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha y Hora Inicio *</label>
          <p-datepicker 
            [(ngModel)]="formData.start_time"
            [showTime]="true"
            dateFormat="dd/mm/yy"
            timeOnly="false"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>

        <!-- Fecha Fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha y Hora Fin *</label>
          <p-datepicker 
            [(ngModel)]="formData.end_time"
            [showTime]="true"
            dateFormat="dd/mm/yy"
            timeOnly="false"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado *</label>
          <p-select 
            [(ngModel)]="formData.status"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar estado"
            styleClass="w-full">
          </p-select>
        </div>

        <!-- Notas -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="formData.notes"
            placeholder="Observaciones adicionales"
            class="w-full"
          />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button 
          label="Cancelar" 
          severity="secondary"
          (onClick)="showReservationDialog = false"
        />
        <p-button 
          label="Guardar" 
          (onClick)="saveReservation()"
          [loading]="saving()"
        />
      </ng-template>
    </p-dialog>
  `
})
export class AdminReservationsComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  saving = signal(false);
  
  selectedStatus: string | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Dialog y formulario
  showReservationDialog = false;
  editingReservation: Reservation | null = null;
  
  formData = {
    user_id: null as number | null,
    space_id: null as number | null,
    start_time: null as Date | null,
    end_time: null as Date | null,
    status: 'confirmed' as string,
    notes: '' as string
  };

  users = signal<any[]>([]);
  spaces = signal<any[]>([]);

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
    this.loadUsers();
    this.loadSpaces();
  }

  loadReservations(): void {
    this.loading.set(true);
    
    let url = `${environment.apiUrl}/reservations`;
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

  loadUsers(): void {
    this.http.get<{ data: any[] }>(`${environment.apiUrl}/users`).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
      }
    });
  }

  loadSpaces(): void {
    this.http.get<{ data: any[] }>(`${environment.apiUrl}/spaces?limit=1000`).subscribe({
      next: (res) => {
        this.spaces.set(res.data || []);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los espacios'
        });
      }
    });
  }

  openNewReservationDialog(): void {
    this.editingReservation = null;
    this.resetForm();
    this.showReservationDialog = true;
  }

  editReservation(reservation: Reservation): void {
    this.editingReservation = reservation;
    this.formData = {
      user_id: reservation.user_id,
      space_id: reservation.space_id,
      start_time: new Date(reservation.start_time),
      end_time: new Date(reservation.end_time),
      status: reservation.status,
      notes: reservation.notes || ''
    };
    this.showReservationDialog = true;
  }

  resetForm(): void {
    this.formData = {
      user_id: null,
      space_id: null,
      start_time: null,
      end_time: null,
      status: 'confirmed',
      notes: ''
    };
  }

  saveReservation(): void {
    if (!this.formData.user_id || !this.formData.space_id || !this.formData.start_time || !this.formData.end_time) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    this.saving.set(true);

    const payload = {
      user_id: this.formData.user_id,
      space_id: this.formData.space_id,
      start_time: this.formatDateTime(this.formData.start_time),
      end_time: this.formatDateTime(this.formData.end_time),
      status: this.formData.status,
      notes: this.formData.notes
    };

    if (this.editingReservation) {
      // Actualizar
      this.http.put(
        `${environment.apiUrl}/reservations/${this.editingReservation.id}`,
        payload
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reservación actualizada'
          });
          this.showReservationDialog = false;
          this.loadReservations();
          this.saving.set(false);
        },
        error: (err) => {
          this.saving.set(false);
          const message = err.error?.message || 'Error al actualizar la reservación';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message
          });
        }
      });
    } else {
      // Crear nueva
      this.http.post(
        `${environment.apiUrl}/reservations`,
        payload
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reservación creada'
          });
          this.showReservationDialog = false;
          this.loadReservations();
          this.saving.set(false);
        },
        error: (err) => {
          this.saving.set(false);
          const message = err.error?.message || 'Error al crear la reservación';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message
          });
        }
      });
    }
  }

  private formatDateTime(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

  deleteReservation(reservation: Reservation): void {
    this.confirmationService.confirm({
      message: '¿Eliminar permanentemente esta reservación? Esta acción no se puede deshacer.',
      header: 'Eliminar Reservación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.http.delete(`${environment.apiUrl}/reservations/${reservation.id}`)
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reservación eliminada permanentemente' });
              this.loadReservations();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la reservación' });
            }
          });
      }
    });
  }
}
