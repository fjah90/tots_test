import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Home - Redirección a listado de espacios
  {
    path: '',
    redirectTo: 'spaces',
    pathMatch: 'full'
  },

  // Auth - Solo para invitados (redirige a home si ya está logueado)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => 
      import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión'
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => 
      import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
    title: 'Registrarse'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Espacios - Público
  {
    path: 'spaces',
    loadChildren: () => 
      import('./features/spaces/spaces.routes').then(m => m.SPACES_ROUTES)
  },

  // Mis Reservaciones - Requiere autenticación (User & Admin)
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/reservations/components/my-reservations/my-reservations.component')
        .then(m => m.MyReservationsComponent),
    title: 'Mis Reservaciones'
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./features/reservations/reservations.routes').then(m => m.RESERVATIONS_ROUTES)
  },

  // Admin - Solo administradores
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => 
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'admin/spaces',
    canActivate: [adminGuard],
    loadComponent: () => 
      import('./features/admin/components/admin-spaces/admin-spaces.component')
        .then(m => m.AdminSpacesComponent),
    title: 'Administrar Espacios'
  },

  // 404 - Not Found
  {
    path: 'not-found',
    loadComponent: () => 
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'Página no encontrada'
  },

  // Wildcard - Redirección a 404
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
