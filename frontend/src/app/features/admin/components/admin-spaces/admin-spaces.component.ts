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

import { SpacesService } from '../../../../core/services/spaces.service';
import { Space } from '../../../../shared/interfaces';

/**
 * Definición de columna para MC-Table / p-table
 * Compatible con @matiascamiletti/mc-kit cuando esté disponible
 * 
 * Para migrar a MC-Table:
 * 1. Instalar: pnpm add @matiascamiletti/mc-kit
 * 2. Importar: import { McTableComponent, McTableColumn } from '@matiascamiletti/mc-kit';
 * 3. Reemplazar <p-table> por <mc-table [data]="spaces()" [columns]="columns">
 */
export interface McTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'boolean' | 'date' | 'template';
  width?: string;
}

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
    TooltipModule
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

  // Computed para estadísticas
  activeCount = computed(() => this.spaces().filter(s => s.is_active).length);
  inactiveCount = computed(() => this.spaces().filter(s => !s.is_active).length);

  /**
   * Configuración de columnas para MC-Table / p-table
   * Esta estructura es compatible con @matiascamiletti/mc-kit
   */
  columns: McTableColumn[] = [
    { 
      field: 'name', 
      header: 'Nombre', 
      sortable: true,
      type: 'text'
    },
    { 
      field: 'capacity', 
      header: 'Capacidad', 
      sortable: true,
      type: 'number',
      width: '120px'
    },
    { 
      field: 'location', 
      header: 'Ubicación', 
      sortable: true,
      type: 'text'
    },
    { 
      field: 'is_active', 
      header: 'Estado', 
      sortable: true,
      type: 'boolean',
      width: '100px'
    },
    { 
      field: 'actions', 
      header: 'Acciones', 
      type: 'template',
      width: '150px'
    }
  ];

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.loading.set(true);
    this.spacesService.getSpaces().subscribe({
      next: (spaces) => {
        this.spaces.set(spaces);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los espacios'
        });
      }
    });
  }

  onSearch(): void {
    const search = this.searchTerm();
    this.spacesService.getSpaces({ search }).subscribe({
      next: (spaces) => this.spaces.set(spaces)
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
      accept: () => this.deleteSpace(space.id)
    });
  }

  private deleteSpace(id: number): void {
    this.spacesService.deleteSpace(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Espacio eliminado correctamente'
        });
        this.loadSpaces();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el espacio'
        });
      }
    });
  }

  onRowSelect(event: any): void {
    console.log('Espacio seleccionado:', event.data);
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
