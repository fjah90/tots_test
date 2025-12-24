import { Routes } from '@angular/router';

export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/my-reservations/my-reservations.component').then(
        m => m.MyReservationsComponent
      ),
    title: 'Mis Reservaciones',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/reservation-form/reservation-form.component').then(
        m => m.ReservationFormComponent
      ),
    title: 'Nueva Reservación',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/reservation-detail/reservation-detail.component').then(
        m => m.ReservationDetailComponent
      ),
    title: 'Detalle de Reservación',
  },
];
