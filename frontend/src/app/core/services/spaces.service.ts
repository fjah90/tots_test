import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Space, SpacePayload } from '../../shared/interfaces';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SpaceFilters {
  capacity?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  available_date?: string; // Formato YYYY-MM-DD
  available_start_time?: string; // Formato HH:mm
  available_end_time?: string; // Formato HH:mm
  timezone?: string; // Timezone del cliente (ej: America/Caracas)
  capacity_min?: number;
  capacity_max?: number;
}

export interface PaginatedSpaces {
  data: Space[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/spaces`;

  // Signals para estado
  readonly spaces = signal<Space[]>([]);
  readonly loading = signal(false);
  readonly selectedSpace = signal<Space | null>(null);

  /**
   * Obtener todos los espacios con filtros opcionales (sin paginación)
   */
  getSpaces(filters?: SpaceFilters): Observable<Space[]> {
    this.loading.set(true);
    
    let params = new HttpParams();
    if (filters?.capacity) {
      params = params.set('capacity', filters.capacity.toString());
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.is_active !== undefined) {
      params = params.set('is_active', filters.is_active ? '1' : '0');
    }

    return this.http.get<ApiResponse<Space[]>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data),
        tap(spaces => this.spaces.set(spaces)),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Obtener espacios con paginación (para infinite scroll)
   */
  getSpacesPaginated(filters?: SpaceFilters): Observable<PaginatedSpaces> {
    let params = new HttpParams();
    
    if (filters?.capacity) {
      params = params.set('capacity', filters.capacity.toString());
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.is_active !== undefined) {
      params = params.set('is_active', filters.is_active ? '1' : '0');
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    if (filters?.available_date) {
      params = params.set('available_date', filters.available_date);
    }
    if (filters?.available_start_time) {
      params = params.set('available_start_time', filters.available_start_time);
    }
    if (filters?.available_end_time) {
      params = params.set('available_end_time', filters.available_end_time);
    }
    if (filters?.timezone) {
      params = params.set('timezone', filters.timezone);
    }
    if (filters?.capacity_min) {
      params = params.set('capacity_min', filters.capacity_min.toString());
    }
    if (filters?.capacity_max) {
      params = params.set('capacity_max', filters.capacity_max.toString());
    }

    return this.http.get<PaginatedApiResponse<Space[]>>(this.apiUrl, { params })
      .pipe(
        map(response => ({
          data: response.data,
          meta: response.meta
        }))
      );
  }

  /**
   * Obtener un espacio por ID
   */
  getSpace(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(space => this.selectedSpace.set(space))
      );
  }

  /**
   * Crear nuevo espacio (solo admin)
   */
  createSpace(payload: SpacePayload): Observable<Space> {
    return this.http.post<ApiResponse<Space>>(this.apiUrl, payload)
      .pipe(
        map(response => response.data),
        tap(space => {
          this.spaces.update(spaces => [...spaces, space]);
        })
      );
  }

  /**
   * Actualizar espacio (solo admin)
   */
  updateSpace(id: number, payload: Partial<SpacePayload>): Observable<Space> {
    return this.http.put<ApiResponse<Space>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(response => response.data),
        tap(updated => {
          this.spaces.update(spaces => 
            spaces.map(s => s.id === id ? updated : s)
          );
        })
      );
  }

  /**
   * Eliminar espacio (solo admin)
   */
  deleteSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.spaces.update(spaces => spaces.filter(s => s.id !== id));
        })
      );
  }

  /**
   * Verificar disponibilidad de un espacio
   */
  checkAvailability(id: number, start: string, end: string): Observable<{ available: boolean }> {
    const params = new HttpParams()
      .set('start_time', start)
      .set('end_time', end);

    return this.http.get<{ available: boolean }>(`${this.apiUrl}/${id}/availability`, { params });
  }
}
