import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

// MC-Table de @matiascamiletti/mc-kit
// NOTA: Simularemos el componente ya que es una librería externa
// En producción, importar: import { McTableComponent, McTableColumn } from '@matiascamiletti/mc-kit';

import { SpacesService } from '../../../../core/services/spaces.service';
import { Space } from '../../../../shared/interfaces';

/**
 * Definición de columna para MC-Table
 * Basado en la documentación de @matiascamiletti/mc-kit
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
    // McTableComponent - Comentado hasta instalar @matiascamiletti/mc-kit
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

  /**
   * Configuración de columnas para MC-Table
   * @matiascamiletti/mc-kit usa esta estructura para definir columnas
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

  /**
   * Cargar espacios desde el API
   */
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

  /**
   * Buscar espacios por nombre
   */
  onSearch(): void {
    const search = this.searchTerm();
    this.spacesService.getSpaces({ search }).subscribe({
      next: (spaces) => this.spaces.set(spaces)
    });
  }

  /**
   * Confirmar eliminación de espacio
   */
  confirmDelete(space: Space): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el espacio "${space.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteSpace(space.id)
    });
  }

  /**
   * Eliminar espacio
   */
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

  /**
   * Handler para selección de fila en MC-Table
   */
  onRowSelect(event: { data: Space }): void {
    console.log('Espacio seleccionado:', event.data);
  }

  /**
   * Obtener severidad del tag según estado
   */
  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  /**
   * Obtener texto del estado
   */
  getStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }
}
