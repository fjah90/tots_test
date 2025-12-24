import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationPayload } from '../../shared/interfaces';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ReservationFilters {
  space_id?: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  from_date?: string;
  to_date?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;

  // Signals para estado reactivo
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Obtener reservaciones del usuario autenticado
   */
  getMyReservations(filters?: ReservationFilters): Observable<Reservation[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (filters?.space_id) {
      params = params.set('space_id', filters.space_id.toString());
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.from_date) {
      params = params.set('from_date', filters.from_date);
    }
    if (filters?.to_date) {
      params = params.set('to_date', filters.to_date);
    }

    return this.http.get<ApiResponse<Reservation[]>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data),
        tap(reservations => this.reservations.set(reservations)),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Obtener reservaciones de un espacio específico (para calendario)
   */
  getSpaceReservations(spaceId: number, fromDate?: string, toDate?: string): Observable<Reservation[]> {
    let params = new HttpParams().set('space_id', spaceId.toString());
    
    if (fromDate) params = params.set('from_date', fromDate);
    if (toDate) params = params.set('to_date', toDate);

    return this.http.get<ApiResponse<Reservation[]>>(`${environment.apiUrl}/spaces/${spaceId}/reservations`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtener reservaciones públicas para el calendario (sin autenticación)
   */
  getCalendarReservations(spaceId?: number): Observable<Reservation[]> {
    let params = new HttpParams();
    
    if (spaceId) {
      params = params.set('space_id', spaceId.toString());
    }

    return this.http.get<ApiResponse<Reservation[]>>(`${environment.apiUrl}/calendar/reservations`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crear nueva reservación
   */
  createReservation(payload: ReservationPayload): Observable<Reservation> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, payload)
      .pipe(
        map(response => response.data),
        tap(reservation => {
          this.reservations.update(list => [...list, reservation]);
        }),
        finalize(() => this.loading.set(false))
      );
  }

  /**
   * Crear reservaciones en múltiples fechas (bulk)
   */
  createBulkReservations(payload: {
    space_id: number;
    dates: string[];
    start_time: string;
    end_time: string;
    notes?: string;
  }): Observable<{ message: string; data: { created: Reservation[]; failed: { date: string; reason: string }[] } }> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ message: string; data: { created: Reservation[]; failed: { date: string; reason: string }[] } }>(
      `${this.apiUrl}/bulk`,
      payload
    ).pipe(
      tap(response => {
        if (response.data.created.length > 0) {
          this.reservations.update(list => [...list, ...response.data.created]);
        }
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Actualizar reservación
   */
  updateReservation(id: number, payload: Partial<ReservationPayload>): Observable<Reservation> {
    return this.http.put<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(response => response.data),
        tap(updated => {
          this.reservations.update(list => 
            list.map(r => r.id === id ? updated : r)
          );
        })
      );
  }

  /**
   * Cancelar reservación
   */
  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        map(response => response.data),
        tap(cancelled => {
          this.reservations.update(list =>
            list.map(r => r.id === id ? cancelled : r)
          );
        })
      );
  }

  /**
   * Eliminar reservación
   */
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.reservations.update(list => list.filter(r => r.id !== id));
        })
      );
  }
}
