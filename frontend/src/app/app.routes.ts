import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'spaces',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'spaces',
    loadChildren: () => 
      import('./features/spaces/spaces.routes').then(m => m.SPACES_ROUTES)
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./features/reservations/reservations.routes').then(m => m.RESERVATIONS_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => 
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'spaces'
  }
];
