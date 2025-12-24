import { Routes } from '@angular/router';

export const CALENDAR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/calendar-view/calendar-view.component')
        .then(m => m.CalendarViewComponent),
    title: 'Calendario de Disponibilidad'
  }
];
