import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// MC-Kit (@mckit) - Librería de tablas de Matías Camiletti
import { MCTable, MCTdTemplateDirective } from '@mckit/table';
import { MCColumn, MCListResponse } from '@mckit/core';

import { SpacesService } from '../../../../core/services/spaces.service';
import { Space } from '../../../../shared/interfaces';

@Component({
  selector: 'app-admin-spaces',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TooltipModule,
    // MC-Kit Components
    MCTable,
    MCTdTemplateDirective,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-spaces.component.html',
})
export class AdminSpacesComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Signals para estado reactivo
  spaces = signal<Space[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  // Paginación para MC-Table
  currentPage = signal(0);
  rowsPerPage = signal(10);

  // Computed para estadísticas
  activeCount = computed(() => this.spaces().filter(s => s.is_active).length);
  inactiveCount = computed(() => this.spaces().filter(s => !s.is_active).length);

  /**
   * MCListResponse para MC-Table con paginación del cliente
   * Estructura requerida por @mckit/table
   */
  tableResponse = computed<MCListResponse<Space>>(() => {
    const allData = this.spaces();
    const page = this.currentPage();
    const perPage = this.rowsPerPage();

    // Calcular datos paginados
    const start = page * perPage;
    const end = start + perPage;
    const paginatedData = allData.slice(start, end);

    const response = new MCListResponse<Space>();
    response.data = paginatedData;
    response.total = allData.length;
    response.per_page = perPage;
    return response;
  });

  /**
   * Configuración de columnas para MC-Table (@mckit/table)
   * Usando MCColumn de @mckit/core
   */
  columns: MCColumn[] = [
    {
      field: 'name',
      title: 'Nombre',
      isSortable: true,
      isShow: true,
    },
    {
      field: 'capacity',
      title: 'Capacidad',
      isSortable: true,
      isShow: true,
    },
    {
      field: 'location',
      title: 'Ubicación',
      isSortable: true,
      isShow: true,
    },
    {
      field: 'is_active',
      title: 'Estado',
      isSortable: true,
      isShow: true,
    },
    {
      field: 'actions',
      title: 'Acciones',
      isShow: true,
    },
  ];

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.loading.set(true);
    this.spacesService.getSpaces().subscribe({
      next: spaces => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: _error => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los espacios',
        });
      },
    });
  }

  onSearch(): void {
    const search = this.searchTerm();
    this.spacesService.getSpaces({ search }).subscribe({
      next: spaces => this.spaces.set(spaces),
    });
  }

  confirmDelete(space: Space): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el espacio "${space.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteSpace(space.id),
    });
  }

  private deleteSpace(id: number): void {
    this.spacesService.deleteSpace(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Espacio eliminado correctamente',
        });
        this.loadSpaces();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el espacio',
        });
      },
    });
  }

  onRowSelect(_event: any): void {
    // Row selection handler - can be extended for detail view
  }

  /**
   * Maneja el evento de cambio de página de MC-Table
   */
  onPageChange(event: any): void {
    // event contiene first (índice del primer elemento) y rows (elementos por página)
    const page = Math.floor(event.first / event.rows);
    this.currentPage.set(page);
    this.rowsPerPage.set(event.rows);
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getActiveCount(): number {
    return this.activeCount();
  }

  getInactiveCount(): number {
    return this.inactiveCount();
  }
}
