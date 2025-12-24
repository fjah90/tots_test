import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { environment } from '../../../../../environments/environment';

interface Stats {
  total_spaces: number;
  total_reservations: number;
  total_users: number;
  reservations_by_status: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  top_spaces: Array<{
    id: number;
    name: string;
    reservations_count: number;
  }>;
  reservations_by_month: Array<{
    month: string;
    count: number;
  }>;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-8 px-6">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold">Dashboard de Estadísticas</h1>
          <p class="text-teal-100 mt-1">Resumen general del sistema de reservaciones</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8 -mt-6">
        @if (loading()) {
          <div class="flex justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
            <p-progressSpinner strokeWidth="4" />
          </div>
        } @else {
          <!-- KPIs principales -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium">Espacios</p>
                  <p class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{{ stats()?.total_spaces || 0 }}</p>
                </div>
                <div class="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <i class="pi pi-building text-2xl text-blue-600 dark:text-blue-400"></i>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium">Reservaciones</p>
                  <p class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{{ stats()?.total_reservations || 0 }}</p>
                </div>
                <div class="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <i class="pi pi-calendar text-2xl text-green-600 dark:text-green-400"></i>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium">Usuarios</p>
                  <p class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{{ stats()?.total_users || 0 }}</p>
                </div>
                <div class="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <i class="pi pi-users text-2xl text-purple-600 dark:text-purple-400"></i>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium">Tasa de Confirmación</p>
                  <p class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{{ confirmationRate() }}%</p>
                </div>
                <div class="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  <i class="pi pi-check-circle text-2xl text-teal-600 dark:text-teal-400"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Estado de reservaciones -->
            <p-card>
              <ng-template #header>
                <div class="p-4 pb-0">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Reservaciones por Estado</h3>
                </div>
              </ng-template>
              <div class="h-64 flex items-center justify-center">
                @if (statusChartData) {
                  <p-chart type="doughnut" [data]="statusChartData" [options]="chartOptions" />
                } @else {
                  <p class="text-gray-500 dark:text-gray-400">Sin datos disponibles</p>
                }
              </div>
            </p-card>

            <!-- Reservaciones por mes -->
            <p-card>
              <ng-template #header>
                <div class="p-4 pb-0">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Reservaciones por Mes</h3>
                </div>
              </ng-template>
              <div class="h-64">
                @if (monthlyChartData) {
                  <p-chart type="bar" [data]="monthlyChartData" [options]="barChartOptions" />
                } @else {
                  <p class="text-gray-500 dark:text-gray-400 text-center py-20">Sin datos disponibles</p>
                }
              </div>
            </p-card>
          </div>

          <!-- Top Espacios -->
          <p-card>
            <ng-template #header>
              <div class="p-4 pb-0">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Espacios Más Reservados</h3>
              </div>
            </ng-template>
            
            @if (stats()?.top_spaces && stats()!.top_spaces.length > 0) {
              <div class="space-y-4">
                @for (space of stats()!.top_spaces; track space.id; let i = $index) {
                  <div class="flex items-center gap-4">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                         [class.bg-yellow-500]="i === 0"
                         [class.bg-gray-400]="i === 1"
                         [class.bg-amber-700]="i === 2"
                         [class.bg-gray-300]="i > 2">
                      {{ i + 1 }}
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-800 dark:text-gray-100">{{ space.name }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-primary">{{ space.reservations_count }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">reservaciones</p>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos de espacios</p>
            }
          </p-card>
        }
      </div>
    </div>
  `
})
export class AdminStatsComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  stats = signal<Stats | null>(null);
  loading = signal(false);

  statusChartData: any;
  monthlyChartData: any;
  
  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    maintainAspectRatio: false
  };

  barChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);

    this.http.get<{ data: Stats }>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.buildCharts(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las estadísticas'
        });
      }
    });
  }

  buildCharts(data: Stats): void {
    // Gráfico de estado
    if (data.reservations_by_status) {
      this.statusChartData = {
        labels: ['Confirmadas', 'Pendientes', 'Canceladas'],
        datasets: [{
          data: [
            data.reservations_by_status.confirmed,
            data.reservations_by_status.pending,
            data.reservations_by_status.cancelled
          ],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#ca8a04', '#dc2626']
        }]
      };
    }

    // Gráfico mensual
    if (data.reservations_by_month && data.reservations_by_month.length > 0) {
      this.monthlyChartData = {
        labels: data.reservations_by_month.map(m => m.month),
        datasets: [{
          label: 'Reservaciones',
          data: data.reservations_by_month.map(m => m.count),
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }]
      };
    }
  }

  confirmationRate(): number {
    const stats = this.stats();
    if (!stats || stats.total_reservations === 0) return 0;
    const confirmed = stats.reservations_by_status?.confirmed || 0;
    return Math.round((confirmed / stats.total_reservations) * 100);
  }
}
