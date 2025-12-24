import { Routes } from '@angular/router';

export const SPACES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/spaces-list/spaces-list.component').then(m => m.SpacesListComponent),
    title: 'Espacios Disponibles',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/space-detail/space-detail.component').then(m => m.SpaceDetailComponent),
    title: 'Detalle del Espacio',
  },
];
