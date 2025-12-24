import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'spaces',
    pathMatch: 'full',
  },
  {
    path: 'spaces',
    loadComponent: () =>
      import('./components/admin-spaces/admin-spaces.component').then(m => m.AdminSpacesComponent),
    title: 'Administrar Espacios',
  },
  {
    path: 'spaces/new',
    loadComponent: () =>
      import('./components/space-form/space-form.component').then(m => m.SpaceFormComponent),
    title: 'Nuevo Espacio',
  },
  {
    path: 'spaces/:id/edit',
    loadComponent: () =>
      import('./components/space-form/space-form.component').then(m => m.SpaceFormComponent),
    title: 'Editar Espacio',
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./components/admin-reservations/admin-reservations.component').then(
        m => m.AdminReservationsComponent
      ),
    title: 'Administrar Reservaciones',
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./components/admin-stats/admin-stats.component').then(m => m.AdminStatsComponent),
    title: 'Estadísticas',
  },
];
